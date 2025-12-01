import pool from "./pool.js";

export async function getUserReview(userId, mediaId) {
  const result = await pool.query(
    `SELECT * FROM reviews WHERE user_id = $1 AND media_id = $2`,
    [userId, mediaId]
  );
  return result.rows[0];
}

export async function upsertReview({
  user_id,
  media_id,
  rating,
  favorite,
  notes,
}) {
  const result = await pool.query(
    `
    INSERT INTO reviews (user_id, media_id, rating, favorite, notes)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id, media_id)
    DO UPDATE SET
      rating = EXCLUDED.rating,
      favorite = EXCLUDED.favorite,
      notes = EXCLUDED.notes
    RETURNING *;
    `,
    [user_id, media_id, rating, favorite, notes]
  );

  return result.rows[0];
}

export async function deleteReview(userId, mediaId) {
  return pool.query(
    `DELETE FROM reviews WHERE user_id = $1 AND media_id = $2`,
    [userId, mediaId]
  );
}

export async function getDashboardItems(userId) {
  const result = await pool.query(
    `
    SELECT 
      m.id AS media_id,
      m.title,
      m.summary,
      m.release_year,
      m.image_url,
      r.rating,
      r.favorite,
      r.notes
    FROM reviews r
    JOIN media m ON m.id = r.media_id
    WHERE r.user_id = $1
    ORDER BY r.updated_at DESC;
    `,
    [userId]
  );

  return result.rows;
}
