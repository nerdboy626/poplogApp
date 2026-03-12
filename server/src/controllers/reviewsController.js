import {
  upsertReview,
  deleteReview,
  getDashboardItems,
  getReviewQuery,
} from "../database/reviewQueries.js";
import {
  findOrCreateMedia,
  findMediaByExternalId,
} from "../database/mediaQueries.js";

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
    res.status(500).json({ error: "Failed to save entry" });
  }
}

export async function deleteUserReview(req, res) {
  const user_id = req.user.id;
  const media_id = req.params.mediaId;

  try {
    await deleteReview(user_id, media_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete entry" });
  }
}

export async function getUserDashboard(req, res) {
  const user_id = req.user.id;

  try {
    const items = await getDashboardItems(user_id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve journal entries" });
  }
}

export async function getUserReview(req, res) {
  const user_id = req.user.id;
  const { mediaType, externalId } = req.params;

  try {
    const media = await findMediaByExternalId(externalId, mediaType);

    if (!media) {
      // user can't have a review if media row doesn't exist
      return res.json(null);
    }

    const review = await getReviewQuery(user_id, media.id);

    if (!review) {
      return res.json(null);
    }

    res.json({
      mediaId: media.id,
      rating: review.rating,
      favorite: review.favorite,
      notes: review.notes,
    });
  } catch (err) {
    console.error("Error fetching user entry:", err);
    res.status(500).json({ error: "Failed to fetch entry" });
  }
}
