import { API_BASE_URL } from "../config/env";
export const mediaDetailsLoader = async ({ params }) => {
  const { mediaType, id } = params;

  const validTypes = ["movie", "tv", "books", "games"];

  if (!validTypes.includes(mediaType)) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const isMovieOrTv = ["movie", "tv"].includes(mediaType);

    const baseUrl = isMovieOrTv
      ? `${API_BASE_URL}/api/movies/details/${mediaType}/${id}`
      : `${API_BASE_URL}/api/${mediaType}/details/${id}`;

    const response = await fetch(baseUrl);

    if (!response.ok) {
      throw new Response("Not Found", { status: 404 });
    }

    const data = await response.json();

    return data;
  } catch (err) {
    console.error("mediaDetailsLoader error:", err);
    throw new Response("Not Found", { status: 404 });
  }
};
