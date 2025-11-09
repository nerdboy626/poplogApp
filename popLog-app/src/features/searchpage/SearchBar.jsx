import "./SearchBar.css";
const SearchBar = ({ query, onQueryChange }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search titles..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
