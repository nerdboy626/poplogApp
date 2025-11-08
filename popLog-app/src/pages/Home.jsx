import { useEffect, useState, useRef } from "react";
import Greeting from "../features/home/Greeting.jsx";
import CardDisplay from "../components/CardDisplay.jsx";
import Carousel from "../components/Carousel.jsx";
import "./Home.css";
const Home = () => {
  const [books, setBooks] = useState([]);
  const [movies, setMovies] = useState([]);
  const [games, setGames] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);

  useEffect(() => {
    // if (hasFetched.current) return; // skip if already fetched
    // hasFetched.current = true;

    const fetchMediaData = async () => {
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
        setBooks(bookData);

        const gamesResponse = await fetch(
          "http://localhost:3500/api/games/trending"
        );
        if (!gamesResponse.ok)
          throw new Error("Network response for games was not ok");

        const gamesData = await gamesResponse.json();
        setGames(gamesData);

        const moviesResponse = await fetch(
          "http://localhost:3500/api/movies/trending/movies"
        );
        if (!moviesResponse.ok)
          throw new Error("Network response for movies was not ok");

        const moviesData = await moviesResponse.json();
        setMovies(moviesData);

        const showsResponse = await fetch(
          "http://localhost:3500/api/movies/trending/shows"
        );
        if (!showsResponse.ok)
          throw new Error("Network response for shows was not ok");

        const showsData = await showsResponse.json();
        setShows(showsData);
      } catch (error) {
        console.error("Error fetching media data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaData();
  }, []);

  return (
    <div className="homepage">
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
      <div className="trending-header">
        <h1>Take a look at these trending titles!</h1>
      </div>
      <main className="trending-displays">
        <h3>Movies</h3>
        {movies.length > 0 && <Carousel itemsArray={movies} />}
        <h3>Shows</h3>
        {shows.length > 0 && <Carousel itemsArray={shows} />}
        <h3>Games</h3>
        {games.length > 0 && <Carousel itemsArray={games} />}
        <h3>Books</h3>
        {books.length > 0 && <Carousel itemsArray={books} />}
      </main>
    </div>
  );
};

export default Home;
