import pool from "./pool.js";

export async function userExists(username, email) {
  const { rows } = await pool.query(
    `SELECT id FROM users WHERE username = $1 OR  email = $2`,
    [username, email]
  );
  return rows;
}

export async function insertUser(username, email, password) {
  await pool.query(
    "INSERT INTO users (username, email, hashed_password) VALUES ($1, $2, $3)",
    [username, email, password]
  );
}

export async function getUser(username) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE username = $1`, [
    username,
  ]);
  return rows;
}
