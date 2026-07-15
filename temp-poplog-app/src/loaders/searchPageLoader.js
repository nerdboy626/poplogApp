export const searchPageLoader = async ({ params }) => {
  const { category } = params;

  const validCategories = ["movies", "books", "games"];

  if (!validCategories.includes(category)) {
    throw new Response("Not Found", { status: 404 });
  }

  return { category };
};
