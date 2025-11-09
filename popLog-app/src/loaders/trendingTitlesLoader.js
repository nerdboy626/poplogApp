export const trendingTitlesLoader = async () => {
  try {
    const bookResponse = await fetch(
      "http://localhost:3500/api/books/search?query=red rising"
    );
    // const bookResponse = await fetch(
    //   "http://localhost:3500/api/books/trending"
    // );
    if (!bookResponse.ok)
      throw new Error("Network response for books was not ok");

    const bookData = await bookResponse.json();

    const gamesResponse = await fetch(
      "http://localhost:3500/api/games/trending"
    );
    if (!gamesResponse.ok)
      throw new Error("Network response for games was not ok");

    const gamesData = await gamesResponse.json();

    const moviesResponse = await fetch(
      "http://localhost:3500/api/movies/trending/movies"
    );
    if (!moviesResponse.ok)
      throw new Error("Network response for movies was not ok");

    const moviesData = await moviesResponse.json();

    const showsResponse = await fetch(
      "http://localhost:3500/api/movies/trending/shows"
    );
    if (!showsResponse.ok)
      throw new Error("Network response for shows was not ok");

    const showsData = await showsResponse.json();
    return {
      books: bookData,
      games: gamesData,
      movies: moviesData,
      shows: showsData,
    };
  } catch (error) {
    console.error("Error fetching media data:", error);
    return { books: [], games: [], movies: [], shows: [] };
  }
};
