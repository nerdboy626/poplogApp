import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../utils/AuthContext.jsx";
import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import CardDisplay from "../components/CardDisplay.jsx";
import "./Journal.css";

const Journal = () => {
  const auth = useAuth();
  const [reviews, setReviews] = useState([]);

  const [mediaFilter, setMediaFilter] = useState("all");
  const [sortByFilter, setSortByFilter] = useState("recent");

  useEffect(() => {
    async function fetchReviews() {
      if (!auth.user) return;
      const baseUrl = `http://localhost:3500/api/reviews/dashboard`;

      try {
        console.log(
          `Trying to grab reviews for user ${auth.user.username} with user id of ${auth.user.id}`,
        );

        const response = await fetchWithAuth(
          baseUrl,
          {
            method: "GET",
          },
          auth,
        );
        const data = await response.json();

        console.log(data);

        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err.message);
      }
    }

    fetchReviews();
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...reviews];

    // Filter by media type
    if (mediaFilter !== "all") {
      result = result.filter((review) => review.media_type === mediaFilter);
    }

    // Sort logic
    if (sortByFilter === "recent") {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    if (sortByFilter === "alphabetical") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortByFilter === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sortByFilter === "favorited") {
      result = result.filter((review) => review.favorite === true);
    }

    return result;
  }, [reviews, mediaFilter, sortByFilter]);

  return (
    <main className="journal-page">
      <header className="journal-header">
        <h1 className="journal-title">Your Journal</h1>
        <p className="journal-subtitle">
          Track, revisit, and edit your media journal
        </p>
      </header>

      <hr className="gradient-divider" />

      <form className="journal-filters">
        <div className="journal-filters__group">
          <label htmlFor="media-filter">View Entries</label>

          <div className="select-wrapper">
            <select
              id="media-filter"
              value={mediaFilter}
              onChange={(e) => setMediaFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="movie">Movies</option>
              <option value="tv">TV</option>
              <option value="games">Games</option>
              <option value="books">Books</option>
            </select>
          </div>
        </div>

        <div className="journal-filters__group">
          <label htmlFor="sort-filter">Sort By</label>

          <div className="select-wrapper">
            <select
              id="sort-filter"
              value={sortByFilter}
              onChange={(e) => setSortByFilter(e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="alphabetical">A → Z</option>
              <option value="rating">My Rating</option>
              <option value="favorited">Favorited</option>
            </select>
          </div>
        </div>
      </form>

      <section className="journal-entries">
        {filteredAndSorted.length === 0 ? (
          <div className="journal-empty">
            <h3 className="journal-empty__title">
              You currently don’t have any entries for the selected filters.
            </h3>

            <p className="journal-empty__subtitle">
              Add some from the home page or search page!
            </p>
          </div>
        ) : (
          filteredAndSorted.map((item) => (
            <CardDisplay
              key={`${item.media_type}-${item.external_id}`}
              id={item.external_id}
              title={item.title}
              description={item.summary}
              releaseYear={item.release_year}
              imageUrl={item.image_url}
              mediaType={item.media_type}
            />
          ))
        )}
      </section>
    </main>
  );
};

export default Journal;
