import { useRef, useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CardDisplay from "./CardDisplay";
import "./Carousel.css";

const Carousel = ({ itemsArray }) => {
  const scrollRef = useRef(null);

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  // Check if arrows should be visible
  const updateArrows = () => {
    const element = scrollRef.current;
    if (!element) return;

    setShowLeft(element.scrollLeft > 5);
    setShowRight(
      element.scrollLeft + element.clientWidth < element.scrollWidth - 5,
    );
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, []);

  const scroll = (direction) => {
    const element = scrollRef.current;
    if (!element) return;

    const scrollAmount = element.clientWidth * 0.9;

    element.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="carousel-wrapper">
      <button
        className={`carousel-arrow left ${showLeft ? "visible" : ""}`}
        onClick={() => scroll("left")}
        disabled={!showLeft}
      >
        <FaChevronLeft />
      </button>

      <div className="carousel" ref={scrollRef} onScroll={updateArrows}>
        {itemsArray.map((item, index) => (
          <CardDisplay
            key={index}
            id={item.id}
            title={item.title}
            description={item.summary}
            releaseYear={item.releaseYear}
            imageUrl={item.coverUrl}
            mediaType={item.mediaType}
          />
        ))}
      </div>

      <button
        className={`carousel-arrow right ${showRight ? "visible" : ""}`}
        onClick={() => scroll("right")}
        disabled={!showRight}
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default Carousel;
