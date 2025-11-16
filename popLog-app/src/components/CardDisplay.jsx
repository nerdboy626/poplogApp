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
  const [positionLeft, setPositionLeft] = useState(false);
  const cardRef = useRef(null);

  const imageIcon = (mediaType) => {
    if (mediaType === "movie") {
      return <BiSolidMoviePlay className="icon" />;
    } else if (mediaType === "game") {
      return <IoGameController className="icon" />;
    } else {
      return <IoIosBook className="icon" />;
    }
  };

  useEffect(() => {
    if (isHovered && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      // check if the card is near the right side of the viewport
      setPositionLeft(rect.right + 260 > window.innerWidth); // 220 is the info box width
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
        <div
          className="card-info-box"
          style={{
            left: positionLeft ? `-${280}px` : "220px", // shift left if needed
          }}
        >
          <h3>
            {title} ({releaseYear})
          </h3>
          <p className="card-desc">{description}</p>
        </div>
      )}
    </div>
  );
};

export default CardDisplay;
