import { useState } from "react";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import "./MediaRate.css";
const MediaRate = ({ rating, favorite, onRatingChange, onFavoriteToggle }) => {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="rate-container">
      <div className="star-container">
        <h3>Your Rating</h3>
        <div className="stars-row">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <FaStar
              key={star}
              onClick={() => onRatingChange(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={`star ${
                star <= (hoverRating || rating) ? "active" : ""
              }`}
            />
          ))}
        </div>
      </div>

      <div className="heart-container">
        <h3>Favorite</h3>

        {favorite ? (
          <FaHeart onClick={onFavoriteToggle} className="heart active" />
        ) : (
          <FaRegHeart onClick={onFavoriteToggle} className="heart" />
        )}
      </div>
    </div>
  );
};

export default MediaRate;
