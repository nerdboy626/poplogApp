import fetch from "node-fetch";
import { getIGDBToken } from "../utils/igdbAuth.js";
import { IGDB_CLIENT_ID } from "../config/env.js";

async function fetchIGDBQuery(query) {
  const token = await getIGDBToken();

  const response = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": `${IGDB_CLIENT_ID}`,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: query,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`IGDB API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  const formattedData = data.map((game) => ({
    id: game.id,
    mediaType: "game",
    title: game.name,
    summary: game.summary || "No summary available.",
    releaseYear: game.first_release_date
      ? new Date(game.first_release_date * 1000).getFullYear()
      : null,
    coverUrl: game.cover
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : null,
    genres: game.genres?.map((genre) => genre.name) || [],
    platforms: game.platforms?.map((platform) => platform.name) || [],
    developers:
      game.involved_companies
        ?.map((company) => company.company.name)
        .join(", ") || null,
    rating:
      typeof game.total_rating === "number"
        ? Math.round(game.total_rating) / 10
        : null,
  }));

  return formattedData;
}

export const getTrendingGames = async (req, res) => {
  const now = Math.floor(Date.now() / 1000);

  const sixMonthsAgo = now - 60 * 60 * 24 * 30 * 6;

  try {
    const queryBody = `
      fields name, summary, first_release_date, cover.image_id,
        involved_companies.company.name, genres.name, platforms.name,
        total_rating, total_rating_count;
      where first_release_date != null
        & first_release_date > ${sixMonthsAgo}
        & first_release_date < ${now}
        & total_rating_count > 10;
      sort total_rating desc;
      limit 30;
    `;

    console.log(`Fetching trending games ... `);

    const trendingGames = await fetchIGDBQuery(queryBody);

    console.log("Successfully obtained trending games!");

    res.json(trendingGames);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Failed to fetch trending games.",
    });
  }
};

export const getGameResults = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  try {
    const queryBody = `
      search "${query}";
      fields name, summary, first_release_date, cover.image_id, 
        involved_companies.company.name, genres.name, platforms.name, 
        total_rating;
      limit 10;
    `;

    console.log(`Fetching games results for ${query} ... `);

    const responseData = await fetchIGDBQuery(queryBody);

    console.log("Successfully obtained game results!");

    res.json(responseData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Failed to fetch game search results.",
    });
  }
};
