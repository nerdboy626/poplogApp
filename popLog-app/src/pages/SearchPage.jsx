import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "../features/searchpage/SearchBar.jsx";
import SearchDisplay from "../features/searchpage/SearchDisplay.jsx";
import GenreMenu from "../features/searchpage/GenreMenu.jsx";
import "./SearchPage.css";

const tmdbOptions = [
  { id: "action", name: "Action & Adventure" },
  { id: "animation", name: "Animation" },
  { id: "comedy", name: "Comedy" },
  { id: "crime", name: "Crime" },
  { id: "documentary", name: "Documentary" },
  { id: "drama", name: "Drama" },
  { id: "family", name: "Family" },
  { id: "fantasy", name: "Fantasy & Sci Fi" },
  { id: "mystery", name: "Mystery" },
  { id: "war", name: "War & Politics" },
  { id: "western", name: "Western" },
];

const nytBookLists = [
  {
    id: "combined-print-and-e-book-fiction",
    name: "Combined Print & E‑Book Fiction",
  },
  {
    id: "combined-print-and-e-book-nonfiction",
    name: "Combined Print & E‑Book Nonfiction",
  },
  { id: "hardcover-fiction", name: "Hardcover Fiction" },
  { id: "hardcover-nonfiction", name: "Hardcover Nonfiction" },
  { id: "trade-fiction-paperback", name: "Paperback Trade Fiction" },
  { id: "paperback-nonfiction", name: "Paperback Nonfiction" },
  {
    id: "advice-how-to-and-miscellaneous",
    name: "Advice, How-To & Miscellaneous",
  },
  {
    id: "childrens-middle-grade-hardcover",
    name: "Children’s Middle Grade Hardcover",
  },
  { id: "picture-books", name: "Children’s Picture Books" },
  { id: "series-books", name: "Children’s & Young Adult Series" },
  { id: "young-adult-hardcover", name: "Young Adult Hardcover" },
  { id: "audio-fiction", name: "Audio Fiction" },
  { id: "audio-nonfiction", name: "Audio NonFiction" },
  { id: "business-books", name: "Business" },
  { id: "graphic-books-and-manga", name: "Graphic Books and Manga" },
  { id: "mass-market-monthly", name: "Mass Market" },
  { id: "middle-grade-paperback-monthly", name: "Middle Grade Paperback" },
  {
    id: "young-adult-paperback-monthly",
    name: "Young Adult Paperback Monthly",
  },
];

const SearchPage = () => {
  const { category } = useParams();

  const [inputValue, setInputValue] = useState("");
  const [results, setResults] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [gameGenres, setGameGenres] = useState([]);
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
    // fetch game genres on mount
    fetchIGDBGenres();
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
    setSelectedGenre(""); // reset dropdown
  }, [category]);

  async function fetchIGDBGenres() {
    try {
      const response = await fetch("http://localhost:3500/api/games/genres");
      const data = await response.json();
      setGameGenres(data); // array of { id, name }
    } catch (err) {
      console.error("Failed to load IGDB genres:", err);
    }
  }

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

  async function fetchGenreResults(genreId) {
    console.log(`Fetching ${category} with genre ID of ${genreId} ...`);

    const response = await fetch(
      `http://localhost:3500/api/${category}/search/${genreId}`
    );

    const data = await response.json();

    setResults(data);
    setSelectedGenre(genreId);

    setSearchCache((prev) => ({
      ...prev,
      [category]: { query: "", results: data },
    }));

    console.log(`${category} by genre successfully fetched!`);
  }

  console.log(results);
  console.log(gameGenres);
  console.log(selectedGenre);

  return (
    <div className="searchpage">
      <SearchBar
        mediaCategory={category}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onSearchSubmit={handleSearchSubmit}
      />
      {category === "movies" && searchCache[category].query === "" && (
        <GenreMenu
          options={tmdbOptions}
          selected={selectedGenre}
          onChange={(value) => fetchGenreResults(value)}
        />
      )}
      {category === "games" && !searchCache[category].query && (
        <GenreMenu
          options={gameGenres} // IGDB genres
          selected={selectedGenre}
          onChange={(value) => fetchGenreResults(value)}
        />
      )}
      {category === "books" && !searchCache[category].query && (
        <GenreMenu
          options={nytBookLists}
          selected={selectedGenre}
          onChange={(value) => fetchGenreResults(value)}
        />
      )}
      <div className="search-display">
        {results.length > 0 &&
          results.map((item, index) => (
            <SearchDisplay key={index} item={item} />
          ))}
      </div>
    </div>
  );
};

export default SearchPage;
