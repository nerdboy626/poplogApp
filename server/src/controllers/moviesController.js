import fetch from "node-fetch";
import { syncMedia } from "../utils/syncMedia.js";
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
let trendingShowsCache = null;
let trendingMoviesCache = null;
let trendingTimestamp = 0;
const TRENDING_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const fetchGenres = async () => {
  try {
    const movieResponse = await fetch(
      "https://api.themoviedb.org/3/genre/movie/list?language=en-US",
      options,
    );
    const tvResponse = await fetch(
      "https://api.themoviedb.org/3/genre/tv/list?language=en-US",
      options,
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
    mediaType: item.media_type,
    title: item.media_type === "movie" ? item.title : item.name,
    summary: item.overview || "No summary available.",
    releaseYear:
      (item.media_type === "movie"
        ? item.release_date?.slice(0, 4)
        : item.first_air_date?.slice(0, 4)) || null,
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
        options,
      ),
      fetch(
        `https://api.themoviedb.org/3/discover/tv?with_genres=${genrePair.tv}&sort_by=popularity.desc&language=en-US`,
        options,
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
      (a, b) => b.popularity - a.popularity,
    );

    const formatted = formatData(combined.slice(0, 30));

    console.log(
      `Returned ${formatted.length} titles for '${genrePair.label}'!`,
    );
    res.json(formatted);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch genre results" });
  }
};

export const getTrendingShows = async (req, res) => {
  const now = Date.now();

  if (trendingShowsCache && now - trendingTimestamp < TRENDING_CACHE_DURATION) {
    console.log("Serving trending shows from cache");
    return res.json(trendingShowsCache);
  }
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

    trendingShowsCache = formattedData;
    trendingTimestamp = now;

    res.json(formattedData);
  } catch (error) {
    console.error("Server error:", error);

    if (trendingShowsCache) {
      console.warn("Returning stale trending shows cache due to error");
      return res.json(trendingShowsCache);
    }

    res.status(500).json({ error: "Failed to fetch trending shows" });
  }
};

export const getTrendingMovies = async (req, res) => {
  const now = Date.now();

  if (
    trendingMoviesCache &&
    now - trendingTimestamp < TRENDING_CACHE_DURATION
  ) {
    console.log("Serving trending movies from cache");
    return res.json(trendingMoviesCache);
  }
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

    trendingMoviesCache = formattedData;
    trendingTimestamp = now;

    res.json(formattedData);
  } catch (error) {
    console.error("Server error:", error);

    if (trendingMoviesCache) {
      console.warn("Returning stale trending shows cache due to error");
      return res.json(trendingMoviesCache);
    }

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
      (item) => item.media_type === "movie" || item.media_type === "tv",
    );

    const formattedData = formatData(filteredData);

    console.log("Successfully obtained movie results!");

    res.json(formattedData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch movie search results" });
  }
};

function formatRuntime(minutes) {
  if (!minutes || typeof minutes !== "number") return null;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;

  return `${hours}h ${mins}m`;
}

export const getTMDBDetailsById = async (req, res) => {
  const { mediaType, id } = req.params;

  if (!id || !mediaType) {
    return res
      .status(400)
      .json({ error: "Missing 'id' or 'mediaType' parameter" });
  }

  if (mediaType !== "movie" && mediaType !== "tv") {
    return res.status(400).json({
      error: "Invalid mediaType. Must be 'movie' or 'tv'.",
    });
  }

  try {
    const url = `https://api.themoviedb.org/3/${mediaType}/${id}?append_to_response=credits`;

    console.log(`Fetching ${mediaType} details for ID ${id} ...`);

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // main cast (first 6 actors)
    const mainCast =
      data.credits?.cast?.slice(0, 6).map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profileUrl: actor.profile_path
          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
          : null,
      })) || [];

    let creators = null;

    if (mediaType === "tv") {
      creators = data.created_by?.length
        ? data.created_by.map((creator) => creator.name).join(", ")
        : null;
    } else {
      // movie directors come from crew
      const directors =
        data.credits?.crew
          ?.filter((person) => person.job === "Director")
          .map((director) => director.name)
          .join(", ") || null;

      creators = directors;
    }

    const tvInfo =
      mediaType === "tv"
        ? {
            numberOfSeasons: data.number_of_seasons || null,
            numberOfEpisodes: data.number_of_episodes || null,
            episodeRuntime: Array.isArray(data.episode_run_time)
              ? formatRuntime(data.episode_run_time[0])
              : null,
          }
        : null;

    const movieInfo =
      mediaType === "movie"
        ? {
            runtime: formatRuntime(data.runtime) || null,
          }
        : null;

    // console.log(data);

    const formatted = {
      id: data.id,
      mediaType,
      title: mediaType === "movie" ? data.title : data.name,
      summary: data.overview || "No summary available.",
      releaseYear:
        (mediaType === "movie"
          ? data.release_date?.slice(0, 4)
          : data.first_air_date?.slice(0, 4)) || null,
      coverUrl: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : null,
      backdropUrl: data.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
        : null,
      rating:
        typeof data.vote_average === "number"
          ? Math.round(data.vote_average * 10) / 10
          : null,
      genres: data.genres?.map((g) => g.name) || [],
      productionCompanies: data.production_companies || [],
      creators,
      cast: mainCast,
      ...tvInfo,
      ...movieInfo,
    };

    await syncMedia(formatted);

    console.log(`Successfully returned details for ID ${id}`);
    res.json(formatted);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch TMDB details" });
  }
};
