import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { BiSolidMoviePlay } from "react-icons/bi";
import { IoGameController } from "react-icons/io5";
import { IoIosBook } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import MediaRate from "./MediaRate";
import "./MediaDetails.css";

const MediaDetails = () => {
  const { mediaType, id } = useParams();
  const [mediaInfo, setMediaInfo] = useState(null);

  const [userRating, setUserRating] = useState(0);
  const [userFavorite, setUserFavorite] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [isReviewed, setIsReviewed] = useState(false); // tracks if save button should appear

  const creatorLabel =
    mediaType === "movie"
      ? "directed by"
      : mediaType === "tv"
      ? "created by"
      : mediaType === "games"
      ? "developed by"
      : "by";

  const titleYear = mediaInfo
    ? [mediaInfo.title, mediaInfo.releaseYear && `(${mediaInfo.releaseYear})`]
        .filter(Boolean)
        .join(" ")
    : "No title available.";

  const showInfo =
    mediaInfo?.mediaType === "tv"
      ? [
          mediaInfo.numberOfSeasons &&
            `${mediaInfo.numberOfSeasons} ${
              mediaInfo.numberOfSeasons === 1 ? "season" : "seasons"
            }`,
          mediaInfo.numberOfEpisodes &&
            `${mediaInfo.numberOfEpisodes} episodes`,
          mediaInfo.episodeRuntime,
        ]
          .filter(Boolean)
          .join(" | ")
      : null;

  useEffect(() => {
    fetchMediaInfo(mediaType, id);
  }, []);

  async function fetchMediaInfo(category, mediaId) {
    const baseUrl =
      category === "movie" || category === "tv"
        ? `http://localhost:3500/api/movies/details/${category}/${mediaId}`
        : `http://localhost:3500/api/${category}/details/${mediaId}`;

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

  const handleSave = async () => {
    const payload = {
      mediaId: id,
      mediaType,
      coverUrl: mediaInfo?.coverUrl,
      title: mediaInfo?.title,
      releaseYear: mediaInfo?.releaseYear,
      summary: mediaInfo?.summary,
      userRating,
      userFavorite,
      userNotes,
    };

    try {
      const response = await fetch("http://localhost:3500/api/userMedia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("Saved successfully!");
        setIsReviewed(false); // hide save button
      } else {
        alert("Failed to save.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving data.");
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
        {Number(mediaInfo?.rating) > 0 && (
          <div className="user-rating">
            <p>{mediaInfo.rating}</p>
            <FaStar className="star-icon" />
          </div>
        )}
        {mediaInfo?.mediaType === "books" && mediaInfo?.pageCount && (
          <div className="pages">
            <p>{mediaInfo.pageCount} pages</p>
          </div>
        )}
        {mediaInfo?.mediaType === "games" && mediaInfo?.platforms && (
          <div className="game-platforms">
            <p>Available on: {mediaInfo.platforms}</p>
          </div>
        )}
        {mediaInfo?.mediaType === "tv" && showInfo && (
          <div className="show-info">
            <p>{showInfo}</p>
          </div>
        )}
        {mediaInfo?.mediaType === "movie" && mediaInfo.runtime && (
          <div className="movie-info">
            <p>Runtime: {mediaInfo.runtime}</p>
          </div>
        )}
        {mediaInfo?.genres.length > 0 && (
          <div className="genres-info">
            {mediaInfo.genres.map((genre, index) => (
              <span key={index} className="genre-info-chip">
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="header">
          <h2>{titleYear}</h2>
        </div>
        {mediaInfo?.creators && (
          <h1>
            {creatorLabel} {mediaInfo.creators}
          </h1>
        )}
        <p>{mediaInfo?.summary}</p>
        <MediaRate
          rating={userRating}
          favorite={userFavorite}
          onRatingChange={(val) => {
            setUserRating(val);
            setIsReviewed(true);
          }}
          onFavoriteToggle={() => {
            setUserFavorite(!userFavorite);
            setIsReviewed(true);
          }}
        />
        <div style={{ marginTop: "1rem" }}>
          <label htmlFor="user-notes" className="notes-label">
            Notes:
          </label>
          <textarea
            id="user-notes"
            value={userNotes}
            onChange={(e) => {
              setUserNotes(e.target.value);
              setIsReviewed(true);
            }}
            placeholder="Write your thoughts here..."
            className="textbox"
          ></textarea>
        </div>

        <button
          className={`save-floating-btn ${isReviewed ? "show" : ""}`}
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default MediaDetails;
