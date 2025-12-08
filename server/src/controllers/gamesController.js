import fetch from "node-fetch";
import { getIGDBToken } from "../utils/igdbAuth.js";
import { IGDB_CLIENT_ID } from "../config/env.js";

const IGDBGamesCache = new Map();
let trendingGamesCache = null;
let trendingGamesTimestamp = 0;
const TRENDING_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchIGDBQuery(query, endpoint = "games") {
  const token = await getIGDBToken();

  const response = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
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

  if (endpoint !== "games") return data;

  const formattedData = data.map((game) => {
    const gameData = {
      id: game.id,
      mediaType: "games",
      title: game.name || null,
      summary: game.summary || "No summary available.",
      releaseYear: game.first_release_date
        ? new Date(game.first_release_date * 1000).getFullYear()
        : null,
      coverUrl: game.cover
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : null,
      genres: game.genres?.map((genre) => genre.name) || [],
      platforms:
        game.platforms?.map((platform) => platform.name).join(", ") || null,
      creators:
        game.involved_companies
          ?.map((company) => company.company.name)
          .join(", ") || null,
      rating:
        typeof game.total_rating === "number"
          ? Math.round(game.total_rating) / 10
          : null,
    };
    IGDBGamesCache.set(game.id, gameData);
    return gameData;
  });

  return formattedData;
}

export const getGameGenres = async (req, res) => {
  try {
    const queryBody = `
      fields name;
      limit 50;
    `;

    console.log(`Fetching game genres ...`);

    const genres = await fetchIGDBQuery(queryBody, "genres");

    res.json(genres);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Failed to fetch game genres.",
    });
  }
};

export const getTrendingGamesByGenre = async (req, res) => {
  const { genreId } = req.params;

  if (!genreId) {
    return res.status(400).json({ error: "Missing genreId parameter" });
  }

  try {
    const queryBody = `
      fields name, summary, first_release_date, cover.image_id,
        involved_companies.company.name, genres.name, platforms.name,
        total_rating, total_rating_count;

      where genres = (${genreId})
        & total_rating_count > 5
        & total_rating != null;

      sort total_rating desc;
      limit 30;
    `;

    console.log(`Fetching popular games for genre ID ${genreId} ...`);

    const games = await fetchIGDBQuery(queryBody);

    console.log("Successfully obtained popular games by genre!");

    res.json(games);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Failed to fetch games for genre.",
    });
  }
};

export const getTrendingGames = async (req, res) => {
  const now = Date.now();

  if (
    trendingGamesCache &&
    now - trendingGamesTimestamp < TRENDING_CACHE_DURATION
  ) {
    console.log("Serving trending games from cache");
    return res.json(trendingGamesCache);
  }

  try {
    const sixMonthsAgo = Math.floor(now / 1000) - 60 * 60 * 24 * 30 * 6;

    const queryBody = `
      fields name, summary, first_release_date, cover.image_id,
        involved_companies.company.name, genres.name, platforms.name,
        total_rating, total_rating_count;
      where first_release_date != null
        & first_release_date > ${sixMonthsAgo}
        & first_release_date < ${Math.floor(now / 1000)}
        & total_rating_count > 10;
      sort total_rating desc;
      limit 30;
    `;

    console.log(`Fetching trending games ... `);

    const trendingGames = await fetchIGDBQuery(queryBody);

    trendingGamesCache = trendingGames;
    trendingGamesTimestamp = now;

    console.log("Successfully obtained trending games!");

    res.json(trendingGames);
  } catch (error) {
    console.error("Server error:", error);

    if (trendingGamesCache) {
      console.warn("Returning stale trending games cache due to error");
      return res.json(trendingGamesCache);
    }

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

export const getGameDetails = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Missing 'id' parameter" });
  }

  const gameId = Number(id);

  try {
    if (IGDBGamesCache.has(gameId)) {
      res.json(IGDBGamesCache.get(gameId));
    } else {
      const queryBody = `
      fields name, summary, first_release_date, cover.image_id,
        involved_companies.company.name, genres.name, platforms.name,
        total_rating, total_rating_count;
      where id = ${gameId};
      limit 1;
    `;

      const responseData = await fetchIGDBQuery(queryBody);

      if (!responseData) {
        return res.status(404).json({ error: "Game not found" });
      }

      res.json(responseData);
    }
  } catch (err) {
    console.error("Error fetching game details:", err);
    res.status(500).json({ error: "Failed to game details." });
  }
};
