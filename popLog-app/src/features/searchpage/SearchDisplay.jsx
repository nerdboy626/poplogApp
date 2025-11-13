import "./SearchDisplay.css";
import { BiSolidMoviePlay } from "react-icons/bi";
import { IoGameController } from "react-icons/io5";
import { IoIosBook } from "react-icons/io";

const SearchDisplay = ({ item }) => {
  const imageIcon = (item) => {
    if (item.mediaType === "book") {
      return <IoIosBook className="icon" />;
    } else if (item.mediaType === "game") {
      return <IoGameController className="icon" />;
    } else {
      return <BiSolidMoviePlay className="icon" />;
    }
  };

  const mediaCreator = (item) => {
    if (item.mediaType === "book") {
      return (
        <>
          {item.authors && (
            <h2 className="search-entry-creator">by {item.authors}</h2>
          )}
        </>
      );
    }
    if (item.mediaType === "game") {
      return (
        <>
          {item.developers && (
            <h2 className="search-entry-creator">by {item.developers}</h2>
          )}
        </>
      );
    }
  };
  return (
    <article className="search-entry">
      <div className="entry-img-container">
        {item.coverUrl ? (
          <img src={item.coverUrl}></img>
        ) : (
          <>
            <p>No Image</p>
            {imageIcon(item)}
          </>
        )}
      </div>
      <div className="search-entry-text">
        <div className="search-entry-header">
          <h2 className="search-entry-title">{item.title}</h2>
          {item.releaseYear && (
            <h2 className="search-entry-year">({item.releaseYear})</h2>
          )}
        </div>
        {mediaCreator(item)}
        {item.genres.length > 0 && (
          <div className="genres-container">
            {item.genres.map((genre, index) => (
              <span key={index} className="genre-chip">
                {genre}
              </span>
            ))}
          </div>
        )}
        <p>{item.summary}</p>
      </div>
    </article>
  );
};

export default SearchDisplay;
