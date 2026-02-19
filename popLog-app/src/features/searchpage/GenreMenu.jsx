import "./GenreMenu.css";

const GenreMenu = ({ options, selected, onChange, showClear, onClear }) => {
  return (
    <div className="genre-row">
      <div className="genre-dropdown">
        <label className="genre-dropdown-label">
          Browse Popular Titles by Genre:
        </label>

        <div className="genre-select-wrapper">
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
      </div>

      <button
        className={`btn btn-primary`}
        onClick={onClear}
        disabled={!showClear}
      >
        Clear Genre
      </button>
    </div>
  );
};

export default GenreMenu;
