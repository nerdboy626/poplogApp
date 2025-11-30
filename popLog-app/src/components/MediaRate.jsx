import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import "./MediaRate.css";
const MediaRate = ({ rating, favorite, onRatingChange, onFavoriteToggle }) => {
  return (
    <div className="rate-container">
      <div className="star-container">
        <h3>Your Rating</h3>
        <div className="stars-row">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <FaStar
              key={star}
              onClick={() => onRatingChange(star)}
              color={star <= rating ? "gold" : "lightgray"}
              className="star"
            />
          ))}
        </div>
      </div>

      <div className="heart-container">
        <h3>Favorite</h3>

        {favorite ? (
          <FaHeart onClick={onFavoriteToggle} className="heart" color="red" />
        ) : (
          <FaRegHeart
            onClick={onFavoriteToggle}
            className="heart"
            color="lightgrey"
          />
        )}
      </div>
    </div>
  );
};

export default MediaRate;
