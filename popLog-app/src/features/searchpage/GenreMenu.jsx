import "./GenreMenu.css";

const GenreMenu = ({ options, selected, onChange }) => {
  return (
    <div className="genre-dropdown">
      <label className="genre-dropdown-label">Browse by Genre:</label>

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
  );
};

export default GenreMenu;
