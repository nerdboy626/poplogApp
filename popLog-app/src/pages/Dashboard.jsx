import { useEffect, useState, useMemo } from "react";
import { useAuth } from "../utils/AuthContext.jsx";
import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import CardDisplay from "../components/CardDisplay.jsx";
import "./Dashboard.css";
const Dashboard = () => {
  const auth = useAuth();
  const [reviews, setReviews] = useState([]);

  const [mediaFilter, setMediaFilter] = useState("all");
  const [sortByFilter, setSortByFilter] = useState("recent");

  useEffect(() => {
    fetchReviews();
  }, []);

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

    if (sortByFilter === "favorited") {
      result = result.filter((review) => review.favorite === true);
    }

    return result;
  }, [reviews, mediaFilter, sortByFilter]);

  return (
    <div>
      <div className="dashboard-controls">
        <label>View Media Entries by:</label>

        <select
          value={mediaFilter}
          onChange={(e) => setMediaFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="movie">Movies</option>
          <option value="tv">TV</option>
          <option value="games">Games</option>
          <option value="books">Books</option>
        </select>

        <label>Sort Entries by:</label>

        <select
          value={sortByFilter}
          onChange={(e) => setSortByFilter(e.target.value)}
        >
          <option value="recent">Most Recent</option>
          <option value="alphabetical">A → Z</option>
          <option value="favorited">Favorited</option>
        </select>
      </div>

      <div className="dashboard-grid">
        {filteredAndSorted.length === 0 ? (
          <div className="dashboard-empty-state">
            <p className="empty-title">
              You currently don’t have any entries for the selected filters.
            </p>
            <p className="empty-subtitle">
              Add some more from the homepage or search page!
            </p>
          </div>
        ) : (
          filteredAndSorted.map((item, index) => (
            <CardDisplay
              key={index}
              id={item.external_id}
              title={item.title}
              description={item.summary}
              releaseYear={item.release_year}
              imageUrl={item.image_url}
              mediaType={item.media_type}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
