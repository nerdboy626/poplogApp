import Greeting from "../features/home/Greeting.jsx";
import Carousel from "../features/home/Carousel.jsx";
import { useLoaderData } from "react-router-dom";
import "./Home.css";
const Home = () => {
  const trendingTitles = useLoaderData();
  const mediaCategories = [
    { name: "Movies", data: trendingTitles.movies },
    { name: "Shows", data: trendingTitles.shows },
    { name: "Games", data: trendingTitles.games },
    { name: "Books", data: trendingTitles.books },
  ];

  return (
    <main className="home-page">
      <Greeting />

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
