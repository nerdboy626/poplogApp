import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "../features/searchpage/SearchBar.jsx";
import Carousel from "../components/Carousel.jsx";
import "./SearchPage.css";
const SearchPage = () => {
  const { category } = useParams();

  // separate typing vs search trigger
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    setInputValue("");
    setQuery("");
    setResults([]);
  }, [category]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    fetchSearchResults(category, query);
  }, [query, category]);

  async function fetchSearchResults(mediaCategory, searchInput) {
    console.log(`Searching ${mediaCategory} for ${searchInput}`);
    let searchData = [];
    const baseUrl = `http://localhost:3500/api/${mediaCategory}/search?query=${searchInput}`;
    const response = await fetch(baseUrl);
    searchData = await response.json();
    setResults(searchData);
  }

  return (
    <div className="searchpage">
      <SearchBar
        mediaCategory={category}
        query={query}
        onInputChange={setInputValue}
        onSearchSubmit={() => setQuery(inputValue)} // only search when submitted
      />
      <div className="search-display">
        {query && <Carousel itemsArray={results} />}
      </div>
    </div>
  );
};

export default SearchPage;
