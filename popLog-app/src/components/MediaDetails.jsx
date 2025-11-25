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

  let titleYear = "";

  if (mediaInfo?.title && mediaInfo?.releaseYear) {
    titleYear = `${mediaInfo.title} (${mediaInfo.releaseYear})`;
  } else if (mediaInfo?.title) {
    titleYear = mediaInfo.title;
  } else if (mediaInfo?.releaseYear) {
    titleYear = mediaInfo.releaseYear;
  } else {
    titleYear = "No title available.";
  }

  let showInfo = "";

  if (mediaInfo?.mediaType === "tv") {
    let episodeArr = [];
    if (mediaInfo.numberOfSeasons) {
      episodeArr.push(
        `${mediaInfo.numberOfSeasons} ${
          mediaInfo.numberOfSeasons === 1 ? "season" : "seasons"
        }`
      );
    }
    if (mediaInfo.numberOfEpisodes) {
      episodeArr.push(`${mediaInfo.numberOfEpisodes} episodes`);
    }
    if (mediaInfo.episodeRuntime) {
      episodeArr.push(mediaInfo.episodeRuntime);
    }
    showInfo = episodeArr.join(" | ");
  }

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

  const handleSave = async () => {
    const payload = {
      mediaId: id,
      mediaType,
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
        {mediaInfo?.mediaType === "games" && mediaInfo?.platforms && (
          <div className="game-platforms">
            <p>Available on: {mediaInfo.platforms}</p>
          </div>
        )}
        {mediaInfo?.mediaType === "tv" && showInfo !== "" && (
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
        {mediaInfo?.creators && creatorDisplay()}
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
          <label
            htmlFor="user-notes"
            style={{
              fontWeight: "bold",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
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
            style={{
              width: "100%",
              minHeight: "100px",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          ></textarea>
        </div>
        {isReviewed && (
          <button
            type="button"
            onClick={handleSave}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default MediaDetails;
