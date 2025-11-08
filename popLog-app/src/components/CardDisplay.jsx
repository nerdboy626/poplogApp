import { useState, useEffect, useRef } from "react";
import "./CardDisplay.css";

const CardDisplay = ({ title, description, releaseYear, imageUrl }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [positionLeft, setPositionLeft] = useState(false);
  const cardRef = useRef(null);

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
      <div className="card">
        <img src={imageUrl} alt={title} className="card-image" />
      </div>

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
