import { Link } from "react-router-dom";
import "./MediaTypes.css";

const MediaTypes = ({ mediaCategory }) => {
  const mediaCategories = [
    { label: "Movies & TV", path: "movies" },
    { label: "Games", path: "games" },
    { label: "Books", path: "books" },
  ];

  return (
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
  );
};

export default MediaTypes;
