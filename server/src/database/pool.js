import pg from "pg";
import { DATABASE_URL } from "../config/env.js";

const pool = new pg.Pool({
  connectionString: `${DATABASE_URL}`,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
