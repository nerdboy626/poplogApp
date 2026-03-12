import { findOrCreateMedia } from "../database/mediaQueries.js";

export async function syncMedia(media) {
  if (!media?.id || !media?.mediaType) return null;

  try {
    const result = await findOrCreateMedia({
      id: media.id,
      mediaType: media.mediaType,
      title: media.title ?? null,
      summary: media.summary ?? null,
      releaseYear: media.releaseYear ?? null,
      coverUrl: media.coverUrl ?? null,
    });

    return result;
  } catch (err) {
    console.error("Media sync failed:", err);
    return null;
  }
}
