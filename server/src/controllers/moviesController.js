import fetch from "node-fetch";
import { TMDB_ACCESS_TOKEN } from "../config/env.js";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
  },
};

let movieGenresMap = {};
let tvGenresMap = {};

const fetchGenres = async () => {
  try {
    const movieResponse = await fetch(
      "https://api.themoviedb.org/3/genre/movie/list?language=en-US",
      options
    );
    const tvResponse = await fetch(
      "https://api.themoviedb.org/3/genre/tv/list?language=en-US",
      options
    );

    const movieData = await movieResponse.json();
    const tvData = await tvResponse.json();

    movieGenresMap = movieData.genres.reduce((acc, genre) => {
      acc[genre.id] = genre.name;
      return acc;
    }, {});

    tvGenresMap = tvData.genres.reduce((acc, genre) => {
      acc[genre.id] = genre.name;
      return acc;
    }, {});

    console.log("Genres cached successfully!");
  } catch (error) {
    console.error("Failed to fetch genres:", error);
  }
};

// call it once at server start
fetchGenres();

function formatData(data) {
  return data.map((item) => ({
    id: item.id,
    mediaType: "movie",
    title: item.media_type === "movie" ? item.title : item.name,
    summary: item.overview || "No summary available.",
    releaseYear:
      item.media_type === "movie"
        ? item.release_date?.slice(0, 4)
        : item.first_air_date?.slice(0, 4),
    coverUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,
    backdropUrl: item.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
      : null,
    rating:
      typeof item.vote_average === "number"
        ? Math.round(item.vote_average * 10) / 10
        : null,
    genres:
      item.media_type === "movie"
        ? item.genre_ids?.map((id) => movieGenresMap[id]).filter(Boolean) || []
        : item.genre_ids?.map((id) => tvGenresMap[id]).filter(Boolean) || [],
  }));
}

const unifiedGenres = {
  action: { movie: 28, tv: 10759, label: "Action & Adventure" },
  animation: { movie: 16, tv: 16, label: "Animation" },
  comedy: { movie: 35, tv: 35, label: "Comedy" },
  crime: { movie: 80, tv: 80, label: "Crime" },
  documentary: { movie: 99, tv: 99, label: "Documentary" },
  drama: { movie: 18, tv: 18, label: "Drama" },
  family: { movie: 10751, tv: 10751, label: "Family" },
  fantasy: { movie: "14,878", tv: 10765, label: "Fantasy / Sci-Fi" },
  mystery: { movie: 9648, tv: 9648, label: "Mystery" },
  war: { movie: 10752, tv: 10768, label: "War & Politics" },
  western: { movie: 37, tv: 37, label: "Western" },
};

export const getByGenre = async (req, res) => {
  const { genreId } = req.params;

  if (!genreId) {
    return res.status(400).json({ error: "Missing 'genreId' parameter" });
  }

  const genrePair = unifiedGenres[genreId.toLowerCase()];
  if (!genrePair) {
    return res.status(400).json({ error: `Invalid genre '${genreId}'` });
  }

  try {
    console.log(`Fetching popular titles for genre '${genrePair.label}' ...`);

    const [moviesRes, tvRes] = await Promise.all([
      fetch(
        `https://api.themoviedb.org/3/discover/movie?with_genres=${genrePair.movie}&sort_by=popularity.desc&language=en-US`,
        options
      ),
      fetch(
        `https://api.themoviedb.org/3/discover/tv?with_genres=${genrePair.tv}&sort_by=popularity.desc&language=en-US`,
        options
      ),
    ]);

    if (!moviesRes.ok || !tvRes.ok) {
      throw new Error(`TMDB API error: ${moviesRes.status}/${tvRes.status}`);
    }

    const [moviesData, tvData] = await Promise.all([
      moviesRes.json(),
      tvRes.json(),
    ]);

    const movies = Array.isArray(moviesData.results)
      ? moviesData.results.map((movie) => ({ ...movie, media_type: "movie" }))
      : [];
    const shows = Array.isArray(tvData.results)
      ? tvData.results.map((tv) => ({ ...tv, media_type: "tv" }))
      : [];

    const combined = [...movies, ...shows].sort(
      (a, b) => b.popularity - a.popularity
    );

    const formatted = formatData(combined.slice(0, 30));

    console.log(
      `Returned ${formatted.length} titles for '${genrePair.label}'!`
    );
    res.json(formatted);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch genre results" });
  }
};

export const getTrendingShows = async (req, res) => {
  try {
    const url = "https://api.themoviedb.org/3/trending/tv/week?language=en-US";

    console.log(`Fetching trending shows ... `);

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    const formattedData = formatData(results.slice(0, 20));

    console.log("Successfully obtained trending shows!");

    res.json(formattedData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch trending shows" });
  }
};

export const getTrendingMovies = async (req, res) => {
  try {
    const url =
      "https://api.themoviedb.org/3/trending/movie/week?language=en-US";

    console.log(`Fetching trending movies ... `);

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const results = Array.isArray(data.results) ? data.results : [];
    const formattedData = formatData(results.slice(0, 30));

    console.log("Successfully obtained trending movies!");

    res.json(formattedData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch trending movies" });
  }
};

export const getTMDBResults = async (req, res) => {
  const { query, page = 1 } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Missing 'query' parameter" });
  }

  try {
    const baseUrl = "https://api.themoviedb.org/3/search/multi";

    const params = new URLSearchParams({
      query,
      include_adult: "false",
      language: "en-US",
      page: page.toString(),
    });

    const url = `${baseUrl}?${params.toString()}`;

    console.log(`Fetching movie results on ${query} ... `);

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    const filteredData = data.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    );

    const formattedData = formatData(filteredData);

    console.log("Successfully obtained movie results!");

    res.json(formattedData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch movie search results" });
  }
};
