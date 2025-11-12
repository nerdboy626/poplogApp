import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "../features/searchpage/SearchBar.jsx";
import GridDisplay from "../features/searchpage/GridDisplay.jsx";
import SearchDisplay from "../features/searchpage/SearchDisplay.jsx";
import "./SearchPage.css";
const SearchPage = () => {
  const { category } = useParams();

  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState([]);
  const [searchCache, setSearchCache] = useState({
    movies: { query: "", results: [] },
    games: { query: "", results: [] },
    books: { query: "", results: [] },
  });

  // load saved cache from localStorage on mount
  useEffect(() => {
    const savedCache = localStorage.getItem("searchCache");
    if (savedCache) {
      setSearchCache(JSON.parse(savedCache));
    }
  }, []);

  // save to localStorage whenever cache changes
  useEffect(() => {
    localStorage.setItem("searchCache", JSON.stringify(searchCache));
  }, [searchCache]);

  // whenever category changes, load its previous search state
  useEffect(() => {
    const current = searchCache[category];
    if (current) {
      setInputValue(current.query);
      setResults(current.results);
    } else {
      setInputValue("");
      setResults([]);
    }
  }, [category, searchCache]);

  async function fetchSearchResults(mediaCategory, searchInput) {
    console.log(`Searching ${mediaCategory} for ${searchInput}`);

    let searchData = [];
    const baseUrl = `http://localhost:3500/api/${mediaCategory}/search?query=${searchInput}`;
    const response = await fetch(baseUrl);
    searchData = await response.json();

    setResults(searchData);
    setSearchCache((prev) => ({
      ...prev,
      [mediaCategory]: { query: searchInput, results: searchData },
    }));
  }

  const handleSearchSubmit = () => {
    if (inputValue.trim()) {
      fetchSearchResults(category, inputValue);
    }
  };

  return (
    <div className="searchpage">
      <SearchBar
        mediaCategory={category}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSearchSubmit={handleSearchSubmit}
      />
      <div className="search-display">
        {/* {results.length > 0 && <Carousel itemsArray={results} />} */}
        {/* {results.length > 0 && <GridDisplay itemsArray={results} />} */}
        {results.length > 0 &&
          results.map((item, index) => (
            <SearchDisplay
              key={index}
              title={item.title}
              description={item.summary}
              releaseYear={item.releaseYear}
              imageUrl={item.coverUrl}
              mediaType={item.mediaType}
            />
          ))}
      </div>
    </div>
  );
};

export default SearchPage;
