import Greeting from "../features/home/Greeting.jsx";
import Carousel from "../components/Carousel.jsx";
import { useLoaderData } from "react-router-dom";
import "./Home.css";
const Home = () => {
  const trendingTitles = useLoaderData();

  return (
    <div className="homepage">
      <Greeting />
      <main className="trending-displays">
        <h3>Movies</h3>
        {trendingTitles.movies.length > 0 && (
          <Carousel itemsArray={trendingTitles.movies} />
        )}
        <h3>Shows</h3>
        {trendingTitles.shows.length > 0 && (
          <Carousel itemsArray={trendingTitles.shows} />
        )}
        <h3>Games</h3>
        {trendingTitles.games.length > 0 && (
          <Carousel itemsArray={trendingTitles.games} />
        )}
        <h3>Books</h3>
        {trendingTitles.books.length > 0 && (
          <Carousel itemsArray={trendingTitles.books} />
        )}
      </main>
    </div>
  );
};

export default Home;
