import { useLoaderData } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "../features/searchpage/SearchBar.jsx";
import SearchDisplay from "../features/searchpage/SearchDisplay.jsx";
import GenreMenu from "../features/searchpage/GenreMenu.jsx";
import genreOptions from "../features/searchpage/constants/genreOptions.js";
import useGameGenres from "../features/searchpage/hooks/useGameGenres.js";
import "./SearchPage.css";

const SearchPage = () => {
  const { category } = useLoaderData();
  const gameGenres = useGameGenres();
  const genreOptionsMap = {
    ...genreOptions,
    games: gameGenres,
  };
  const [inputValue, setInputValue] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searchCache, setSearchCache] = useState({
    movies: { query: "", searchResults: [], genre: "", genreResults: [] },
    games: { query: "", searchResults: [], genre: "", genreResults: [] },
    books: { query: "", searchResults: [], genre: "", genreResults: [] },
  });
  const entry = searchCache[category];
  const isInitialState =
    entry.query === "" &&
    entry.genre === "" &&
    entry.searchResults.length === 0 &&
    entry.genreResults.length === 0;
  const showClearButton = inputValue !== "" || entry.query !== "";
  const showGenreClear = entry.genre !== "";
  const displayArray =
    entry.query !== "" ? entry.searchResults : entry.genreResults;

  useEffect(() => {
    if (inputValue.trim()) {
      setSearchError("");
    }
  }, [inputValue]);

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
    setInputValue(entry.query);
  }, [category]);

  function handleClear() {
    setSearchCache((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        query: "",
        searchResults: [],
      },
    }));

    setInputValue(""); // reset UI input
  }

  function handleClearGenre() {
    setSearchCache((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        genre: "",
        genreResults: [],
      },
    }));
  }

  async function fetchSearchResults(searchInput) {
    console.log(`Searching ${category} for ${searchInput}`);

    const response = await fetch(
      `http://localhost:3500/api/${category}/search?query=${searchInput}`,
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
    if (!inputValue.trim()) {
      setSearchError("Search field cannot be empty");
      return;
    }
    setSearchError(""); // clear error if valid
    if (inputValue.trim()) {
      fetchSearchResults(inputValue);
    }
  };

  async function fetchGenreResults(genreId) {
    console.log(`Fetching ${category} with genre ID of ${genreId} ...`);

    const response = await fetch(
      `http://localhost:3500/api/${category}/search/${genreId}`,
    );

    const data = await response.json();

    setSearchCache((prev) => ({
      ...prev,
      [category]: { ...prev[category], genre: genreId, genreResults: data },
    }));

    console.log(`${category} by ${genreId} successfully fetched!`);
    console.log(data);
  }

  return (
    <main className="search-page">
      <section className="search-page__controls">
        <SearchBar
          mediaCategory={category}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSearchSubmit={handleSearchSubmit}
          showClear={showClearButton}
          onClear={handleClear}
          error={searchError}
        />

        {entry.query === "" && (
          <GenreMenu
            mediaCategory={category}
            options={genreOptionsMap[category]}
            selected={entry.genre}
            onChange={(value) => fetchGenreResults(value)}
            showClear={showGenreClear}
            onClear={handleClearGenre}
          />
        )}
      </section>

      <section className="search-page__results">
        {isInitialState && (
          <div className="search-page__welcome">
            <h2>Find your next journal entry here!</h2>
            <p>
              Search for movies, games, or books — or browse by genre to get
              started.
            </p>
          </div>
        )}
        {displayArray.length === 0 && entry.query !== "" && (
          <div className="search-page__empty">
            <div className="search-page__empty-icon">🔍</div>

            <h3>
              No results found
              {entry.query && (
                <>
                  {" "}
                  for <strong>"{entry.query}"</strong>
                </>
              )}
            </h3>

            <p>Try adjusting your search or selecting a different category.</p>
          </div>
        )}

        {displayArray.length > 0 &&
          displayArray.map((item, index) => (
            <SearchDisplay key={index} item={item} />
          ))}
      </section>
    </main>
  );
};

export default SearchPage;
