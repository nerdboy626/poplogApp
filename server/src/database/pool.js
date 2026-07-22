import pg from "pg";
import { DATABASE_URL, NODE_ENV } from "../config/env.js";

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export default pool;
