import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { BiSolidMoviePlay } from "react-icons/bi";
import { IoGameController } from "react-icons/io5";
import { IoIosBook } from "react-icons/io";
import { FaStar, FaSortUp, FaSortDown } from "react-icons/fa";
import MediaRate from "../features/mediadetails/MediaRate.jsx";
import { useAuth } from "../utils/AuthContext.jsx";
import { fetchWithAuth } from "../utils/fetchWithAuth.js";
import toast from "react-hot-toast";
import { useLoaderData } from "react-router-dom";
import { API_BASE_URL } from "../config/env.js";
import "./MediaDetails.css";

const MediaDetails = () => {
  const auth = useAuth();
  const mediaInfo = useLoaderData();
  const { mediaType, id } = useParams();

  const [userRating, setUserRating] = useState(0);
  const [userFavorite, setUserFavorite] = useState(false);
  const [userNotes, setUserNotes] = useState("");
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [serverId, setServerId] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [savedState, setSavedState] = useState(null);

  const showSave =
    savedState === null
      ? userRating > 0 || userFavorite || userNotes.trim() !== ""
      : savedState.rating !== userRating ||
        savedState.favorite !== userFavorite ||
        savedState.notes !== userNotes;

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

    const baseUrl = `${API_BASE_URL}/api/reviews/${mediaType}/${id}`;

    try {
      const response = await fetchWithAuth(baseUrl, { method: "GET" }, auth);
      const data = await response.json();

      if (data) {
        setUserRating(data.rating);
        setUserFavorite(data.favorite);
        setUserNotes(data.notes);
        setServerId(data.mediaId);
        setShowDelete(true);
        setSavedState({
          rating: data.rating,
          favorite: data.favorite,
          notes: data.notes,
        });
      }
    } catch (err) {
      console.error("Error fetching review:", err.message);
    }
  }

  const imageIcon = () => {
    if (mediaType === "books")
      return <IoIosBook className="media-details__icon" />;
    if (mediaType === "games")
      return <IoGameController className="media-details__icon" />;
    return <BiSolidMoviePlay className="media-details__icon" />;
  };

  const handleSave = async () => {
    if (!auth.isLoggedIn) {
      toast.error("You must be logged in.", {
        id: "main",
      });
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
        `${API_BASE_URL}/api/reviews/save`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        auth,
      );

      const data = await response.json().catch(() => null);

      if (response.ok) {
        toast.success("Entry saved!", { id: "main" });
        setServerId(data.media_id);
        setShowDelete(true);
        setSavedState({
          rating: userRating,
          favorite: userFavorite,
          notes: userNotes,
        });
      } else {
        toast.error(data.error, {
          id: "main",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/reviews/delete/${serverId}`,
        { method: "DELETE" },
        auth,
      );

      if (response.ok) {
        setUserRating(0);
        setUserFavorite(false);
        setUserNotes("");
        setShowDelete(false);
        setShowDeleteModal(false);
        setSavedState(null);
        toast.success("Entry deleted.", { id: "main" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="media-details">
      {/* Sidebar */}
      <aside className="media-details__sidebar">
        <div className="media-details__cover">
          {mediaInfo?.coverUrl ? (
            <img src={mediaInfo.coverUrl} />
          ) : (
            <>
              <p>No Image</p>
              {imageIcon()}
            </>
          )}
        </div>

        {Number(mediaInfo?.rating) > 0 && (
          <div className="media-details__rating">
            <p>{mediaInfo.rating}</p>
            <FaStar className="media-details__rating-star" />
          </div>
        )}

        <div className="media-details__meta">
          {mediaInfo?.runtime && <p>Runtime: {mediaInfo.runtime}</p>}
          {showInfo && <p>{showInfo}</p>}
          {mediaInfo?.platforms && <p>Platforms: {mediaInfo.platforms}</p>}
          {mediaInfo?.pageCount && <p>{mediaInfo.pageCount} pages</p>}
        </div>

        {mediaInfo?.genres?.length > 0 && (
          <div className="media-details__genres">
            {mediaInfo.genres.map((genre, i) => (
              <span key={i} className="media-details__genre-chip">
                {genre}
              </span>
            ))}
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="media-details__main">
        <header className="media-details__header">
          <h1 className="media-details__header-title">{titleYear}</h1>
          <hr className="gradient-divider" />
          {mediaInfo?.creators && (
            <h2 className="media-details__header-subtitle">
              {creatorLabel} {mediaInfo.creators}
            </h2>
          )}
        </header>

        <section className="media-details__summary">
          <h3>Description</h3>

          {mediaInfo?.summary?.length > 525 ? (
            <>
              <div
                className={`media-details__summary-wrapper ${
                  isSummaryExpanded ? "expanded" : "collapsed"
                }`}
              >
                <p className="media-details__summary-text">
                  {mediaInfo.summary}
                </p>
              </div>

              <div className="media-details__summary-toggle-container">
                <button
                  className="media-details__summary-toggle"
                  onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                >
                  {isSummaryExpanded ? "Show less" : "Show more"}
                  {isSummaryExpanded ? <FaSortUp /> : <FaSortDown />}
                </button>
              </div>
            </>
          ) : (
            <p className="media-details__summary-text"> {mediaInfo?.summary}</p>
          )}
        </section>

        <MediaRate
          rating={userRating}
          favorite={userFavorite}
          onRatingChange={(val) => {
            setUserRating(val);
          }}
          onFavoriteToggle={() => {
            setUserFavorite(!userFavorite);
          }}
        />

        <section className="media-details__notes">
          <label htmlFor="notes">
            <h3>Your Notes</h3>
          </label>

          <textarea
            id="notes"
            value={userNotes}
            onChange={(e) => {
              setUserNotes(e.target.value);
            }}
            placeholder="Write your thoughts..."
          />
        </section>

        {showDelete && (
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete Entry
          </button>
        )}
      </main>

      <button
        className={`media-details__save-btn btn btn-accent ${
          showSave ? "show" : ""
        }`}
        onClick={handleSave}
      >
        Save
      </button>

      {showDeleteModal && (
        <div
          className="media-details__delete-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="media-details__delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="media-details__delete-modal-title">
              Delete Journal Entry?
            </h1>

            <p className="media-details__delete-modal-text">
              This will permanently remove this entry.
            </p>

            <div className="media-details__delete-actions">
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
