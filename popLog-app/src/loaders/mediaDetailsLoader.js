export const mediaDetailsLoader = async ({ params }) => {
  const { mediaType, id } = params;

  const validTypes = ["movie", "tv", "books", "games"];

  if (!validTypes.includes(mediaType)) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const baseUrl =
      mediaType === "movie" || mediaType === "tv"
        ? `http://localhost:3500/api/movies/details/${mediaType}/${id}`
        : `http://localhost:3500/api/${mediaType}/details/${id}`;

    console.log(`Searching ${mediaType} for ${id}`);

    const response = await fetch(baseUrl);

    if (!response.ok) {
      throw new Response("Not Found", { status: 404 });
    }

    const data = await response.json();

    console.log(data);

    return data;
  } catch (error) {
    console.error("Error fetching media data:", error);
    throw new Response("Not Found", { status: 404 });
  }
};
