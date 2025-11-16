import "./GenreMenu.css";

const GenreMenu = ({ options, selected, onChange, showClear, onClear }) => {
  return (
    <div className="genre-row">
      <div className="genre-dropdown">
        <label className="genre-dropdown-label">
          Browse Popular Titles by Genre:
        </label>

        <select
          className="genre-dropdown-select"
          value={selected}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select a genre</option>

          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
      </div>

      <button
        className={`clear-genre-button ${showClear ? "visible" : ""}`}
        onClick={onClear}
      >
        Clear Genre
      </button>
    </div>
  );
};

export default GenreMenu;
