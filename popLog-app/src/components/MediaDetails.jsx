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
import toast from "react-hot-toast";
import { useLoaderData } from "react-router-dom";
import "./MediaDetails.css";

const MediaDetails = () => {
  const auth = useAuth();
  const mediaInfo = useLoaderData();
  const { mediaType, id } = useParams();

  const [userRating, setUserRating] = useState(0);
  const [userFavorite, setUserFavorite] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [showSave, setShowSave] = useState(false); // tracks if save button should appear
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [serverId, setServerId] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (auth.isLoggedIn) {
      fetchReview();
    }
  }, [auth.isLoggedIn, mediaType, id]);

  async function fetchReview() {
    if (!auth.isLoggedIn) return;

    console.log(
      `Searching to see if ${auth.user.username} has a review for ${mediaType} with an id of ${id}`,
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
    if (!auth.isLoggedIn) {
      toast.error("Sorry, you must be logged in to perform this action.");
      return;
    }
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
        auth,
      );

      const data = await response.json().catch(() => null);

      console.log(`The handle save data was`);
      console.log(data);

      if (response.ok) {
        console.log(`The handle save data was`);
        console.log(data);
        toast.success("Entry saved!");
        setServerId(data.media_id);
        setShowDelete(true);
        setShowSave(false); // hide save button
      } else {
        console.error("Backend error:", data);
        toast.error(`${data.error}`);
      }
    } catch (err) {
      console.error("Error saving review:", err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:3500/api/reviews/delete/${serverId}`,
        { method: "DELETE" },
        auth,
      );

      if (response.ok) {
        // Reset UI
        setUserRating(0);
        setUserFavorite(false);
        setUserNotes("");
        setShowDelete(false);
        setShowSave(false);
        setShowDeleteModal(false);

        toast.success("Entry deleted.");
      } else {
        const data = await response.json().catch(() => null);

        console.error("Backend error:", data);
        toast.error(`${data.error}`);
      }
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
          <hr className="gradient-divider"></hr>
          {mediaInfo?.creators && (
            <h2>
              {creatorLabel} {mediaInfo.creators}
            </h2>
          )}
        </div>

        <div className="rp-summary">
          <h3>Description</h3>
          {mediaInfo?.summary?.length > 525 ? (
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
                  {isSummaryExpanded ? <FaSortUp /> : <FaSortDown />}
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
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Entry
          </button>
        )}

        <button
          className={`save-floating-btn btn btn-accent ${showSave ? "show" : ""}`}
          onClick={handleSave}
        >
          Save
        </button>
      </div>

      {showDeleteModal && (
        <div
          className="delete-modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h1>Delete Journal Entry?</h1>

            <p>This will permanently remove this entry from your journal.</p>

            <div className="delete-modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button className="btn btn-danger" onClick={handleDelete}>
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaDetails;
