import { useEffect, useState, useRef } from "react";
import Greeting from "../features/home/Greeting.jsx";
import CardDisplay from "../components/CardDisplay.jsx";
const Home = () => {
  const [books, setBooks] = useState([]);
  const [movies, setMovies] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);

  useEffect(() => {
    // if (hasFetched.current) return; // skip if already fetched
    // hasFetched.current = true;

    const fetchMediaData = async () => {
      try {
        const bookResponse = await fetch(
          "http://localhost:3500/api/books/search?query=hunger games"
        );
        if (!bookResponse.ok)
          throw new Error("Network response for books was not ok");

        const bookData = await bookResponse.json();
        setBooks(bookData);

        const gamesResponse = await fetch(
          "http://localhost:3500/api/games/search?query=last of us"
        );
        if (!gamesResponse.ok)
          throw new Error("Network response for games was not ok");

        const gamesData = await gamesResponse.json();
        setGames(gamesData);

        const moviesResponse = await fetch(
          "http://localhost:3500/api/movies/search?query=andor"
        );
        if (!moviesResponse.ok)
          throw new Error("Network response for movies was not ok");

        const moviesData = await moviesResponse.json();
        setMovies(moviesData);
      } catch (error) {
        console.error("Error fetching media data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaData();
  }, []);

  return (
    <div>
      <Greeting />
      {/* {loading ? (
        <p>Loading books...</p>
      ) : books.length > 0 ? (
        <CardDisplay
          title={books[0].title}
          imageUrl={books[0].coverUrl}
          description={books[0].summary}
        />
      ) : (
        <p>No books found.</p>
      )} */}
      {books.length > 0 && (
        <CardDisplay
          title={books[0].title}
          imageUrl={books[0].coverUrl}
          description={books[0].summary}
        />
      )}
      {games.length > 0 && (
        <CardDisplay
          title={games[0].title}
          imageUrl={games[0].coverUrl}
          description={games[0].summary}
        />
      )}
      {movies.length > 0 && (
        <CardDisplay
          title={movies[0].title}
          imageUrl={movies[0].coverUrl}
          description={movies[0].summary}
        />
      )}
    </div>
  );
};

export default Home;
