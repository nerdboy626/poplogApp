import { Link } from "react-router-dom";
import "./SearchBar.css";

const SearchBar = ({
  mediaCategory,
  inputValue,
  onInputChange,
  onSearchSubmit,
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
        <input
          id="searchInput"
          name="searchInput"
          type="text"
          placeholder="Search titles..."
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
        />
        <button type="submit" id="searchButton">
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
