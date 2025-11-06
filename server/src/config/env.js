import dotenv from "dotenv";
dotenv.config();

export const {
  PORT,
  DATABASE_URL,
  ACCESS_TOKEN_SECRET,
  TMDB_ACCESS_TOKEN,
  GOOGLE_API_KEY,
  IGDB_CLIENT_ID,
  IGDB_CLIENT_SECRET,
  NYT_API_KEY,
} = process.env;
