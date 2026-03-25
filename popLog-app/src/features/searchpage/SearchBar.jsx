import { Link } from "react-router-dom";
import { BiSolidMoviePlay } from "react-icons/bi";
import { IoGameController } from "react-icons/io5";
import { IoIosBook } from "react-icons/io";
import "./SearchBar.css";

const SearchBar = ({
  mediaCategory,
  inputValue,
  onInputChange,
  onSearchSubmit,
  showClear,
  onClear,
  error,
}) => {
  const mediaCategories = [
    {
      label: "Movies & TV",
      path: "movies",
      icon: <BiSolidMoviePlay />,
    },
    {
      label: "Games",
      path: "games",
      icon: <IoGameController />,
    },
    {
      label: "Books",
      path: "books",
      icon: <IoIosBook />,
    },
  ];

  const placeHolder =
    mediaCategory === "movies" ? "movies & tv" : mediaCategory;

  function handleSubmit(e) {
    e.preventDefault();
    onSearchSubmit(); // trigger parent’s search
  }

  return (
    <section className="search-bar">
      <nav className="search-bar__categories">
        {mediaCategories.map((category) => (
          <Link
            key={category.path}
            to={`/search-page/${category.path}`}
            className={`search-bar__category ${
              mediaCategory === category.path ? "active" : ""
            }`}
          >
            <span className="search-bar__icon">{category.icon}</span>
            {category.label}
          </Link>
        ))}
      </nav>

      <form className="search-bar__form" onSubmit={handleSubmit}>
        <div className="search-bar__input-wrapper">
          <input
            id="searchInput"
            name="searchInput"
            type="text"
            placeholder={`Search all ${placeHolder}...`}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            className={error ? "search-bar__input--error" : ""}
          />
          {showClear && (
            <button
              type="button"
              className="search-bar__clear-btn btn btn-ghost"
              onClick={onClear}
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          id="searchButton"
          disabled={!inputValue.trim()}
          className="btn btn-primary"
        >
          Search
        </button>
      </form>
      {error && <p className="search-bar__error">{error}</p>}
    </section>
  );
};

export default SearchBar;
