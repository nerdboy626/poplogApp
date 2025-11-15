import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "../features/searchpage/SearchBar.jsx";
import SearchDisplay from "../features/searchpage/SearchDisplay.jsx";
import GenreMenu from "../features/searchpage/GenreMenu.jsx";
import genreOptions from "../features/searchpage/constants/genreOptions.js";
import useGameGenres from "../features/searchpage/hooks/useGameGenres.js";
import "./SearchPage.css";

const SearchPage = () => {
  const { category } = useParams();
  const gameGenres = useGameGenres();
  const genreOptionsMap = {
    ...genreOptions,
    games: gameGenres,
  };
  const [inputValue, setInputValue] = useState("");
  const [searchCache, setSearchCache] = useState({
    movies: { query: "", searchResults: [], genre: "", genreResults: [] },
    games: { query: "", searchResults: [], genre: "", genreResults: [] },
    books: { query: "", searchResults: [], genre: "", genreResults: [] },
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

  useEffect(() => {
    const entry = searchCache[category];
    setInputValue(entry.query);
  }, [category]);

  async function fetchSearchResults(searchInput) {
    console.log(`Searching ${category} for ${searchInput}`);

    const response = await fetch(
      `http://localhost:3500/api/${category}/search?query=${searchInput}`
    );
    const searchData = await response.json();

    setSearchCache((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        query: searchInput,
        searchResults: searchData,
      },
    }));
  }

  const handleSearchSubmit = () => {
    if (inputValue.trim()) {
      fetchSearchResults(inputValue);
    }
  };

  async function fetchGenreResults(genreId) {
    console.log(`Fetching ${category} with genre ID of ${genreId} ...`);

    const response = await fetch(
      `http://localhost:3500/api/${category}/search/${genreId}`
    );

    const data = await response.json();

    setSearchCache((prev) => ({
      ...prev,
      [category]: { ...prev[category], genre: genreId, genreResults: data },
    }));

    console.log(`${category} by ${genreId} successfully fetched!`);
  }

  function displayResults() {
    const entry = searchCache[category];
    if (inputValue === "" || entry.searchResults.length == 0) {
      return (
        <>
          {entry.genreResults.length > 0 &&
            entry.genreResults.map((item, index) => (
              <SearchDisplay key={index} item={item} />
            ))}
        </>
      );
    } else {
      return (
        <>
          {entry.searchResults.length > 0 &&
            entry.searchResults.map((item, index) => (
              <SearchDisplay key={index} item={item} />
            ))}
        </>
      );
    }
  }

  return (
    <div className="searchpage">
      <SearchBar
        mediaCategory={category}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSearchSubmit={handleSearchSubmit}
      />
      {(searchCache[category].query === "" || inputValue === "") && (
        <GenreMenu
          options={genreOptionsMap[category]}
          selected={searchCache[category].genre}
          onChange={(value) => fetchGenreResults(value)}
        />
      )}
      <div className="search-display">{displayResults()}</div>
    </div>
  );
};

export default SearchPage;
