import pool from "./pool.js";

export async function findOrCreateMedia({
  id,
  mediaType,
  title,
  summary,
  releaseYear,
  coverUrl,
}) {
  const result = await pool.query(
    `
    INSERT INTO media (external_id, media_type, title, summary, release_year, image_url)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (external_id, media_type)
    DO UPDATE SET
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      release_year = EXCLUDED.release_year,
      image_url = EXCLUDED.image_url
    RETURNING *;
    `,
    [id, mediaType, title, summary, releaseYear, coverUrl]
  );

  return result.rows[0];
}

export async function getMediaById(mediaId) {
  const result = await pool.query(`SELECT * FROM media WHERE id = $1`, [
    mediaId,
  ]);
  return result.rows[0];
}
