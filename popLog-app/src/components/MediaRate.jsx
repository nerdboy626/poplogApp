import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import "./MediaRate.css";
const MediaRate = ({ rating, favorite, onRatingChange, onFavoriteToggle }) => {
  return (
    <div className="rate-container">
      <div>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <FaStar
            key={star}
            onClick={() => onRatingChange(star)}
            color={star <= rating ? "gold" : "lightgray"}
            className="star"
          />
        ))}
      </div>

      <div onClick={onFavoriteToggle} className="heart">
        {favorite ? <FaHeart color="red" /> : <FaRegHeart />}
      </div>
    </div>
  );
};

export default MediaRate;
