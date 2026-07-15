import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiSolidMoviePlay } from "react-icons/bi";
import { IoGameController } from "react-icons/io5";
import { IoIosBook } from "react-icons/io";
import "./SearchDisplay.css";

const SearchDisplay = ({ item }) => {
  if (!item) return null;

  const genresRef = useRef(null);
  const [fadeLeft, setFadeLeft] = useState(false);
  const [fadeRight, setFadeRight] = useState(false);

  useEffect(() => {
    const el = genresRef.current;
    if (!el) return;

    const checkFade = () => {
      setFadeLeft(el.scrollLeft > 0);
      setFadeRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

    el.addEventListener("scroll", checkFade);

    const observer = new ResizeObserver(checkFade);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", checkFade);
      observer.disconnect();
    };
  }, []);

  const imageIcon = (item) => {
    if (item.mediaType === "books") {
      return <IoIosBook className="search-card__icon" />;
    }
    if (item.mediaType === "games") {
      return <IoGameController className="search-card__icon" />;
    }
    return <BiSolidMoviePlay className="search-card__icon" />;
  };

  return (
    <Link
      to={`/media/${item.mediaType}/${item.id}`}
      className="search-card__link"
    >
      <article className="search-card">
        <figure className="search-card__cover">
          {item.coverUrl ? (
            <img src={item.coverUrl}></img>
          ) : (
            <>
              <p>No Image</p>
              {imageIcon(item)}
            </>
          )}
        </figure>
        <div className="search-card__content">
          <header className="search-card__header">
            <h2 className="search-card__title">{item.title}</h2>
            {item.releaseYear && (
              <h2 className="search-card__year">({item.releaseYear})</h2>
            )}
          </header>
          <hr className="gradient-divider"></hr>
          {item.creators && (
            <p className="search-card__creator">by {item.creators}</p>
          )}
          {item.genres.length > 0 && (
            <div
              className={[
                "search-card__genres-wrapper",
                fadeLeft && "fade-left",
                fadeRight && "fade-right",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="search-card__genres" ref={genresRef}>
                {item.genres.map((genre, index) => (
                  <span key={index} className="search-card__genre">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
          <p className="search-card__summary">{item.summary}</p>
        </div>
      </article>
    </Link>
  );
};

export default SearchDisplay;
