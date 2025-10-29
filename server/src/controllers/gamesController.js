import fetch from "node-fetch";
import { getIGDBToken } from "../utils/igdbAuth.js";

export const getGameResults = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Missing query parameter" });
  }

  try {
    const token = await getIGDBToken();

    console.log(`Fetching games results for ${query} ... `);

    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": process.env.IGDB_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: `
        search "${query}";
        fields name, summary, first_release_date, cover.image_id, 
               involved_companies.company.name, genres.name, platforms.name, 
               total_rating;
        limit 10;
      `,
    });

    const data = await response.json();

    const formattedData = data.map((game) => ({
      id: game.id,
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
        game.involved_companies?.map((company) => company.company.name) || [],
      rating: game.total_rating ? Math.round(game.total_rating) : null,
    }));

    console.log("Successfully obtained game results!");

    res.json(formattedData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Failed to fetch game search results.",
    });
  }
};
