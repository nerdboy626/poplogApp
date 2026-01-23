import pool from "./pool.js";

export async function userExists(username, email) {
  const { rows } = await pool.query(
    `SELECT id FROM users WHERE username = $1 OR  email = $2`,
    [username, email],
  );
  return rows;
}

export async function insertUser(username, email, password) {
  const result = await pool.query(
    "INSERT INTO users (username, email, hashed_password) VALUES ($1, $2, $3) RETURNING id, username",
    [username, email, password],
  );
  return result.rows[0];
}

export async function getUserByEmail(email) {
  const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return rows;
}

export async function createPasswordResetToken(userId, tokenHash, expiresAt) {
  await pool.query(
    `
    INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
    VALUES ($1, $2, $3)
    `,
    [userId, tokenHash, expiresAt],
  );
}

export async function getPasswordResetToken(tokenHash) {
  const { rows } = await pool.query(
    `
    SELECT *
    FROM password_reset_tokens
    WHERE token_hash = $1
      AND expires_at > NOW()
    `,
    [tokenHash],
  );

  return rows[0];
}

export async function deleteAllPasswordResetTokens(userId) {
  await pool.query(`DELETE FROM password_reset_tokens WHERE user_id = $1`, [
    userId,
  ]);
}

export async function updateUserPassword(userId, hashedPassword) {
  await pool.query(
    `
    UPDATE users
    SET hashed_password = $1
    WHERE id = $2
    `,
    [hashedPassword, userId],
  );
}
