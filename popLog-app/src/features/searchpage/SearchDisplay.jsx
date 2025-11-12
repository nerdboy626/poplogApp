import "./SearchDisplay.css";
import { BiSolidMoviePlay } from "react-icons/bi";
import { IoGameController } from "react-icons/io5";
import { IoIosBook } from "react-icons/io";

const SearchDisplay = ({
  title,
  description,
  releaseYear,
  imageUrl,
  mediaType,
}) => {
  const imageIcon = (mediaType) => {
    if (mediaType == "movie") {
      return <BiSolidMoviePlay className="icon" />;
    } else if (mediaType == "game") {
      return <IoGameController className="icon" />;
    } else {
      return <IoIosBook className="icon" />;
    }
  };
  return (
    <article className="search-entry">
      <div className="entry-img-container">
        {imageUrl ? (
          <img src={imageUrl}></img>
        ) : (
          <>
            <p>No Image</p>
            {imageIcon(mediaType)}
          </>
        )}
      </div>
      <div>
        <h2>{title}</h2>
        <b>{releaseYear}</b>
        <p>{description}</p>
      </div>
    </article>
  );
};

export default SearchDisplay;
