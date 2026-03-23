import "./GenreMenu.css";

const GenreMenu = ({
  mediaCategory,
  options,
  selected,
  onChange,
  showClear,
  onClear,
}) => {
  const labelCategory =
    mediaCategory === "movies"
      ? "Movies & TV"
      : mediaCategory.charAt(0).toUpperCase() + mediaCategory.slice(1);

  return (
    <section className="genre-menu">
      <div className="genre-menu__controls">
        <label htmlFor="genre-select" className="genre-menu__label">
          Browse Popular {labelCategory} by Genre:
        </label>

        <div className="genre-menu__select-wrapper">
          <select
            id="genre-select"
            className="genre-menu__select"
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
        className="btn btn-primary"
        onClick={onClear}
        disabled={!showClear}
      >
        Clear Genre
      </button>
    </section>
  );
};

export default GenreMenu;
