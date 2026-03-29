import { API_BASE_URL } from "../config/env";
export const trendingTitlesLoader = async () => {
  try {
    const [booksRes, gamesRes, moviesRes, showsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/books/trending`),
      fetch(`${API_BASE_URL}/api/games/trending`),
      fetch(`${API_BASE_URL}/api/movies/trending/movies`),
      fetch(`${API_BASE_URL}/api/movies/trending/shows`),
    ]);

    if (!booksRes.ok || !gamesRes.ok || !moviesRes.ok || !showsRes.ok) {
      throw new Error("One or more requests failed");
    }

    const [books, games, movies, shows] = await Promise.all([
      booksRes.json(),
      gamesRes.json(),
      moviesRes.json(),
      showsRes.json(),
    ]);

    return { books, games, movies, shows };
  } catch (err) {
    console.error("trendingTitlesLoader error:", err);
    return { books: [], games: [], movies: [], shows: [] };
  }
};
