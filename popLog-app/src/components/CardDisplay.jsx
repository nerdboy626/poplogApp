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
      return <IoIosBook className="media-card__icon" />;
    } else if (mediaType === "games") {
      return <IoGameController className="media-card__icon" />;
    } else {
      return <BiSolidMoviePlay className="media-card__icon" />;
    }
  };

  useEffect(() => {
    if (!isHovered || !cardRef.current) return;

    const card = cardRef.current;
    const tooltipWidth = Math.min(260, window.innerWidth * 0.3);
    const gap = 12;

    const rect = card.getBoundingClientRect();

    const spaceRight = window.innerWidth - rect.right;

    const tooltip = card.querySelector(".media-card__tooltip");
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
    <article
      className="media-card"
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/media/${mediaType}/${id}`} className="media-card__link">
        <div className="media-card__image-container">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${title} cover`}
              className="media-card__image"
            />
          ) : (
            <>
              <p>No Image</p>
              {imageIcon(mediaType)}
            </>
          )}
        </div>
      </Link>

      {isHovered && (
        <div className="media-card__tooltip">
          <h3>
            {title} {releaseYear && `(${releaseYear})`}
          </h3>
          <p className="media-card__description">{description}</p>
        </div>
      )}
    </article>
  );
};

export default CardDisplay;
