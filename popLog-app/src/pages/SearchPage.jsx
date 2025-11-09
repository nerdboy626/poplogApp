import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MediaTypes from "../features/searchpage/MediaTypes.jsx";
import SearchBar from "../features/searchpage/SearchBar.jsx";
import "./SearchPage.css";
const SearchPage = () => {
  const { category } = useParams();
  const [query, setQuery] = useState("");

  return (
    <div className="searchpage">
      <MediaTypes mediaCategory={category} />
      <SearchBar query={query} onQueryChange={setQuery} />
    </div>
  );
};

export default SearchPage;
