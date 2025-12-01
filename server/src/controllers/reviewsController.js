import {
  upsertReview,
  deleteReview,
  getDashboardItems,
} from "../database/reviewQueries.js";
import { findOrCreateMedia } from "../database/mediaQueries.js";

export async function saveReview(req, res) {
  const user_id = req.user.id;

  const {
    id,
    mediaType,
    title,
    summary,
    releaseYear,
    coverUrl,
    rating,
    favorite,
    notes,
  } = req.body;

  try {
    const media = await findOrCreateMedia({
      id,
      mediaType,
      title,
      summary,
      releaseYear,
      coverUrl,
    });

    const review = await upsertReview({
      user_id,
      media_id: media.id,
      rating,
      favorite,
      notes,
    });

    res.json(review);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save review" });
  }
}

export async function deleteUserReview(req, res) {
  const user_id = req.user.id;
  const media_id = req.params.mediaId;

  try {
    await deleteReview(user_id, media_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete review" });
  }
}

export async function getUserDashboard(req, res) {
  const user_id = req.user.id;

  try {
    const items = await getDashboardItems(user_id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve dashboard items" });
  }
}
