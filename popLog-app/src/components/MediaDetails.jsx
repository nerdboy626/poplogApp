import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { BiSolidMoviePlay } from "react-icons/bi";
import { IoGameController } from "react-icons/io5";
import { IoIosBook } from "react-icons/io";
import { FaStar } from "react-icons/fa";
import { FaSortUp } from "react-icons/fa";
import { FaSortDown } from "react-icons/fa";
import MediaRate from "./MediaRate.jsx";
import { useAuth } from "../utils/AuthContext.jsx";
import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import "./MediaDetails.css";

const MediaDetails = () => {
  const auth = useAuth();
  const { mediaType, id } = useParams();
  const [mediaInfo, setMediaInfo] = useState(null);

  const [userRating, setUserRating] = useState(0);
  const [userFavorite, setUserFavorite] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [showSave, setShowSave] = useState(false); // tracks if save button should appear
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [serverId, setServerId] = useState(0);

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
    if (auth.isLoggedIn) {
      fetchReview();
    }
  }, [auth.isLoggedIn]);

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

  async function fetchReview() {
    if (!auth.isLoggedIn) return;

    console.log(
      `Searching to see if ${auth.user.username} has a review for ${mediaType} with an id of ${id}`
    );

    const baseUrl = `http://localhost:3500/api/reviews/${mediaType}/${id}`;

    try {
      const response = await fetchWithAuth(baseUrl, { method: "GET" }, auth);
      const data = await response.json();

      console.log("The fetch review data was", data);

      if (data) {
        setUserRating(data.rating);
        setUserFavorite(data.favorite);
        setUserNotes(data.notes);
        setServerId(data.mediaId);
        setShowDelete(true);
      }
    } catch (err) {
      console.error("Error fetching review:", err.message);
    }
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
      id,
      mediaType,
      title: mediaInfo?.title,
      summary: mediaInfo?.summary,
      releaseYear: mediaInfo?.releaseYear,
      coverUrl: mediaInfo?.coverUrl,
      rating: userRating,
      favorite: userFavorite,
      notes: userNotes,
    };

    try {
      const response = await fetchWithAuth(
        "http://localhost:3500/api/reviews/save",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        auth
      );

      const data = await response.json().catch(() => null);

      console.log(`The handle save data was`);
      console.log(data);

      if (response.ok) {
        alert("Saved successfully!");
        setServerId(data.media_id);
        setShowDelete(true);
        setShowSave(false); // hide save button
      } else {
        console.error("Backend error:", data);
        alert("Failed to save.");
      }
    } catch (err) {
      console.error("Error saving review:", err.message);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your review? This cannot be undone."
    );

    if (!confirmed) return;

    try {
      const response = await fetchWithAuth(
        `http://localhost:3500/api/reviews/delete/${serverId}`,
        { method: "DELETE" },
        auth
      );

      if (!response.ok) {
        alert("Failed to delete review.");
        return;
      }

      // Reset UI
      setUserRating(0);
      setUserFavorite(false);
      setUserNotes("");
      setShowDelete(false);
      setShowSave(false);

      alert("Review deleted.");
    } catch (err) {
      console.error("Error deleting review:", err.message);
    }
  };

  return (
    <div className="media-details-container">
      <div className="left-panel">
        <div className="lp-img-container">
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
          <div className="lp-user-rating">
            <p>{mediaInfo.rating}</p>
            <FaStar className="lp-star-icon" />
          </div>
        )}

        {mediaInfo?.mediaType === "movie" && mediaInfo.runtime && (
          <div className="lp-movie-info">
            <p>Runtime: {mediaInfo.runtime}</p>
          </div>
        )}

        {mediaInfo?.mediaType === "tv" && showInfo && (
          <div className="lp-show-info">
            <p>{showInfo}</p>
          </div>
        )}

        {mediaInfo?.mediaType === "games" && mediaInfo?.platforms && (
          <div className="lp-game-platforms">
            <p>Available on: {mediaInfo.platforms}</p>
          </div>
        )}

        {mediaInfo?.mediaType === "books" && mediaInfo?.pageCount && (
          <div className="lp-pages">
            <p>{mediaInfo.pageCount} pages</p>
          </div>
        )}

        {mediaInfo?.genres?.length > 0 && (
          <div className="lp-genres">
            {mediaInfo.genres.map((genre, index) => (
              <span key={index} className="lp-genre-chip">
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="right-panel">
        <div className="rp-header">
          <h1>{titleYear}</h1>
          <hr></hr>
          {mediaInfo?.creators && (
            <h2>
              {creatorLabel} {mediaInfo.creators}
            </h2>
          )}
        </div>

        <div className="rp-summary">
          <h3>Description</h3>
          {mediaInfo?.summary?.length > 550 ? (
            <>
              <div
                className={`rp-summary-wrapper ${
                  isSummaryExpanded ? "expanded" : "collapsed"
                }`}
              >
                <p className="rp-summary-text">{mediaInfo?.summary}</p>
              </div>
              <div className="rp-toggle-container">
                <button
                  className="rp-summary-toggle"
                  onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                >
                  {isSummaryExpanded ? "Show less" : "Show more"}
                  {isSummaryExpanded ? (
                    <FaSortUp className="rp-arrow-icon" />
                  ) : (
                    <FaSortDown className="rp-arrow-icon" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <p className="rp-summary-text">{mediaInfo?.summary}</p>
          )}
        </div>

        <MediaRate
          rating={userRating}
          favorite={userFavorite}
          onRatingChange={(val) => {
            setUserRating(val);
            setShowSave(true);
          }}
          onFavoriteToggle={() => {
            setUserFavorite(!userFavorite);
            setShowSave(true);
          }}
        />

        <div className="rp-text-section">
          <label htmlFor="user-notes">
            <h3>Your Notes</h3>
          </label>
          <textarea
            id="user-notes"
            value={userNotes}
            onChange={(e) => {
              setUserNotes(e.target.value);
              setShowSave(true);
            }}
            placeholder="Write your thoughts here..."
            className="textbox"
          ></textarea>
        </div>

        {showDelete && (
          <button className="delete-review-btn" onClick={handleDelete}>
            Delete Review
          </button>
        )}

        <button
          className={`save-floating-btn ${showSave ? "show" : ""}`}
          onClick={handleSave}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default MediaDetails;
