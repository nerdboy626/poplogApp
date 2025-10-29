import fetch from "node-fetch";
import { GOOGLE_API_KEY } from "../config/env.js";

export const getBookResults = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Missing 'query' parameter" });
  }

  console.log(query);

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query
    )}&key=${GOOGLE_API_KEY}&maxResults=10`;

    console.log(`Fetching book results on ${query} ...`);

    const response = await fetch(url);
    const data = await response.json();

    const formattedData =
      data.items?.map((item) => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors,
        summary: item.volumeInfo.description,
        coverUrl: item.volumeInfo.imageLinks?.thumbnail,
        publishedDate: item.volumeInfo.publishedDate,
      })) || [];

    console.log("Successfully obtained book results!");

    res.json(formattedData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch book search results" });
  }
};
