import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { BiSolidMoviePlay } from "react-icons/bi";
import { IoGameController } from "react-icons/io5";
import { IoIosBook } from "react-icons/io";
import "./MediaDetails.css";

const MediaDetails = () => {
  const { mediaType, id } = useParams();
  const [mediaInfo, setMediaInfo] = useState(null);

  useEffect(() => {
    fetchMediaInfo(mediaType, id);
  }, []);

  async function fetchMediaInfo(category, mediaId) {
    let baseUrl = ``;

    if (category === "movie" || category === "tv") {
      baseUrl = `http://localhost:3500/api/movies/details/${category}/${mediaId}`;
    } else {
      baseUrl = `http://localhost:3500/api/${category}/details/${mediaId}`;
    }

    console.log(`Searching ${category} for ${mediaId}`);

    const response = await fetch(baseUrl);

    const data = await response.json();

    console.log(data);

    setMediaInfo(data);
  }

  const imageIcon = () => {
    if (mediaType === "books") {
      return <IoIosBook className="icon" />;
    } else if (mediaType === "games") {
      return <IoGameController className="icon" />;
    } else {
      return <BiSolidMoviePlay className="icon" />;
    }
  };

  const creatorDisplay = () => {
    if (mediaType === "movie") {
      return <h1>directed by {mediaInfo.creators}</h1>;
    } else if (mediaType === "tv") {
      return <h1>created by {mediaInfo.creators}</h1>;
    } else {
      return <h1>by {mediaInfo.creators}</h1>;
    }
  };

  return (
    <div className="media-details-container">
      <div className="left-panel">
        <div className="img-container">
          {mediaInfo?.coverUrl ? (
            <img src={mediaInfo.coverUrl}></img>
          ) : (
            <>
              <p>No Image</p>
              {imageIcon()}
            </>
          )}
        </div>
        {mediaInfo?.genres.length > 0 && (
          <div className="genres-container">
            {mediaInfo.genres.map((genre, index) => (
              <span key={index} className="genre-chip">
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="header">
          {mediaInfo?.title && <h2>{mediaInfo.title}</h2>}
          {mediaInfo?.releaseYear && <h2>({mediaInfo.releaseYear})</h2>}
        </div>
        {mediaInfo?.creators && creatorDisplay()}
        <p>{mediaInfo?.summary}</p>
        {/* user rating */}
        {/* notes textarea */}
      </div>
    </div>
  );
};

export default MediaDetails;
