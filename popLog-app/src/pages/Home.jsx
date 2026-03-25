import { useAuth } from "../utils/AuthContext.jsx";
import Carousel from "../features/home/Carousel.jsx";
import { Link } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
import "./Home.css";
const Home = () => {
  const auth = useAuth();
  const trendingTitles = useLoaderData();
  const mediaCategories = [
    { name: "Movies", data: trendingTitles.movies },
    { name: "Shows", data: trendingTitles.shows },
    { name: "Games", data: trendingTitles.games },
    { name: "Books", data: trendingTitles.books },
  ];

  return (
    <main className="home-page">
      <header className="home-header">
        {auth.isLoggedIn ? (
          <>
            <h1 className="home-header__title">Welcome back</h1>
            <p className="home-header__subtitle">
              Here’s what people are loving right now
            </p>
          </>
        ) : (
          <>
            <h1 className="home-header__title">Discover what’s trending</h1>
            <p className="home-header__subtitle">
              Track your favorites by <Link to="/login">signing in</Link>
            </p>
          </>
        )}
      </header>

      <hr className="gradient-divider" />

      <section className="home-trending">
        {mediaCategories.map((category) => (
          <section>
            <h2 className="home-trending__title">{category.name}</h2>
            {category.data.length > 0 && (
              <Carousel itemsArray={category.data} />
            )}
          </section>
        ))}
      </section>
    </main>
  );
};

export default Home;
