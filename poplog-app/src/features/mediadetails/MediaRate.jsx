import { useState } from "react";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import "./MediaRate.css";
const MediaRate = ({ rating, favorite, onRatingChange, onFavoriteToggle }) => {
  const [hoverRating, setHoverRating] = useState(0);
  return (
    <div className="media-rate">
      <div className="media-rate__stars">
        <h3 className="media-rate__title">Your Rating</h3>
        <div className="media-rate__stars-row">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <FaStar
              key={star}
              onClick={() => onRatingChange(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className={`media-rate__star-icon ${
                star <= (hoverRating || rating) ? "active" : ""
              }`}
            />
          ))}
        </div>
      </div>

      <div className="media-rate__favorite">
        <h3 className="media-rate__title">Favorite</h3>

        {favorite ? (
          <FaHeart
            onClick={onFavoriteToggle}
            className="media-rate__heart-icon active"
          />
        ) : (
          <FaRegHeart
            onClick={onFavoriteToggle}
            className="media-rate__heart-icon"
          />
        )}
      </div>
    </div>
  );
};

export default MediaRate;
