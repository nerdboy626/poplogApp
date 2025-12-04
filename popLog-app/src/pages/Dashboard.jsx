import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext.jsx";
import CardDisplay from "../components/CardDisplay.jsx";
import "./Dashboard.css";
const Dashboard = () => {
  const auth = useAuth();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    const baseUrl = `http://localhost:3500/api/reviews/dashboard`;

    console.log(
      `Trying to grab reviews for user ${auth.user.username} with user id of ${auth.user.id}`
    );

    const response = await fetch(baseUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.user.token}`,
      },
    });
    const data = await response.json();

    console.log(data);

    setReviews(data);
  }

  return (
    <div>
      <div className="dashboard-grid">
        {reviews.length > 0 &&
          reviews.map((item, index) => (
            <CardDisplay
              key={index}
              id={item.external_id}
              title={item.title}
              description={item.summary}
              releaseYear={item.release_year}
              imageUrl={item.image_url}
              mediaType={item.media_type}
            />
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
