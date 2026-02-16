import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BiSolidMoviePlay } from "react-icons/bi";
import { IoGameController } from "react-icons/io5";
import { IoIosBook } from "react-icons/io";
import "./CardDisplay.css";

const CardDisplay = ({
  id,
  title,
  description,
  releaseYear,
  imageUrl,
  mediaType,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const imageIcon = (mediaType) => {
    if (mediaType === "books") {
      return <IoIosBook className="icon" />;
    } else if (mediaType === "games") {
      return <IoGameController className="icon" />;
    } else {
      return <BiSolidMoviePlay className="icon" />;
    }
  };

  useEffect(() => {
    if (!isHovered || !cardRef.current) return;

    const card = cardRef.current;
    const tooltipWidth = Math.min(260, window.innerWidth * 0.3);
    const gap = 12;

    const rect = card.getBoundingClientRect();

    const spaceRight = window.innerWidth - rect.right;

    const tooltip = card.querySelector(".card-info-box");
    if (!tooltip) return;

    if (spaceRight >= tooltipWidth + gap) {
      // Place tooltip to the right
      tooltip.style.left = `${card.offsetWidth + gap}px`;
      tooltip.style.right = "auto";
    } else {
      // Place tooltip to the left
      tooltip.style.right = `${card.offsetWidth + gap}px`;
      tooltip.style.left = "auto";
    }
  }, [isHovered]);

  return (
    <div
      className="card-container"
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/media/${mediaType}/${id}`} className="card-link">
        <div className="card">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="card-image" />
          ) : (
            <>
              <p>No Image</p>
              {imageIcon(mediaType)}
            </>
          )}
        </div>
      </Link>

      {isHovered && (
        <div className="card-info-box">
          <h3>
            {title} {releaseYear && `(${releaseYear})`}
          </h3>
          <p className="card-desc">{description}</p>
        </div>
      )}
    </div>
  );
};

export default CardDisplay;
