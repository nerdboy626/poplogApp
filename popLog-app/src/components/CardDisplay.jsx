import { useState } from "react";
import "./CardDisplay.css";

const CardDisplay = ({ title, imageUrl, description }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card">
        <img src={imageUrl} alt={title} className="card-image" />
      </div>

      {isHovered && (
        <div className="card-info-box">
          <h3>{title}</h3>
          <p className="card-desc">{description}</p>
        </div>
      )}
    </div>
  );
};

export default CardDisplay;
