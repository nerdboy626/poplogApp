import { Link } from "react-router-dom";
import "./SearchBar.css";

const SearchBar = ({
  mediaCategory,
  inputValue,
  onInputChange,
  onSearchSubmit,
  showClear,
  onClear,
}) => {
  const mediaCategories = [
    { label: "Movies & TV", path: "movies" },
    { label: "Games", path: "games" },
    { label: "Books", path: "books" },
  ];

  function handleSubmit(e) {
    e.preventDefault();
    onSearchSubmit(); // trigger parent’s search
  }

  return (
    <div className="search-menu">
      <div className="media-selector">
        {mediaCategories.map((category) => (
          <Link
            key={category.path}
            to={`/searchpage/${category.path}`}
            className={`category-link ${
              mediaCategory === category.path ? "active" : ""
            }`}
          >
            {category.label}
          </Link>
        ))}
      </div>

      <form className="search-bar" onSubmit={handleSubmit}>
        <div className="search-input-wrapper">
          <input
            id="searchInput"
            name="searchInput"
            type="text"
            placeholder="Search all titles..."
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
          />
          {showClear && (
            <button type="button" className="clear-button" onClick={onClear}>
              ✕
            </button>
          )}
        </div>
        <button type="submit" id="searchButton">
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
