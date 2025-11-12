import fetch from "node-fetch";
import { TMDB_ACCESS_TOKEN } from "../config/env.js";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
  },
};

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
  }));
}

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
