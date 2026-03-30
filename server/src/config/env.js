import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = process.env.DATABASE_URL;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN;
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
export const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
export const IGDB_CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;
export const NYT_API_KEY = process.env.NYT_API_KEY;
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
