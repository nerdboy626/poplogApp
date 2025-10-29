import fetch from "node-fetch";
import { TMDB_ACCESS_TOKEN } from "../config/env.js";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
  },
};

export const getTrendingMovies = async (req, res) => {
  try {
    const url =
      "https://api.themoviedb.org/3/trending/movie/day?language=en-US";

    console.log(`Fetching trending movies ... `);

    const response = await fetch(url, options);
    const data = await response.json();

    console.log("Successfully obtained trending movies!");

    res.json(data);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch trending movies" });
  }
};

export const getMovieResults = async (req, res) => {
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
    //console.log(url);

    console.log(`Fetching movie results on ${query} ... `);

    const response = await fetch(url, options);
    const data = await response.json();

    const filteredData = data.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv"
    );

    const formattedData = filteredData.map((item) => ({
      id: item.id,
      mediaType: item.media_type,
      title: item.media_type === "movie" ? item.title : item.name,
      summary: item.overview || "No description available.",
      releaseYear:
        item.media_type === "movie"
          ? item.release_date?.slice(0, 4)
          : item.first_air_date?.slice(0, 4),
      posterUrl: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : null,
      backdropUrl: item.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
        : null,
      rating: item.vote_average
        ? Math.round(item.vote_average * 10) / 10
        : null,
    }));

    console.log("Successfully obtained movie results!");

    res.json(formattedData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch movie search results" });
  }
};
