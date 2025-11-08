import { useState, useEffect } from "react";
import CardDisplay from "./CardDisplay";
import "./Carousel.css";

const Carousel = ({ itemsArray }) => {
  return (
    <div className="carousel">
      {itemsArray.map((item, index) => (
        <CardDisplay
          key={index}
          title={item.title}
          description={item.summary}
          releaseYear={item.releaseYear}
          imageUrl={item.coverUrl}
        />
      ))}
    </div>
  );
};

export default Carousel;
