import fetch from "node-fetch";
import { syncMedia } from "../utils/syncMedia.js";
import { findMediaByExternalId } from "../database/mediaQueries.js";
import { GOOGLE_API_KEY, NYT_API_KEY } from "../config/env.js";

const TRENDING_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

const googleBooksCache = new Map();

let trendingBooksCache = null;
let trendingBooksTimestamp = 0;

const booksByListCache = new Map();
const BOOKS_BY_LIST_CACHE_DURATION = 24 * 60 * 60 * 1000;

const fetchJSON = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }

  return response.json();
};

async function fetchNYTList(category) {
  return fetchJSON(
    `https://api.nytimes.com/svc/books/v3/lists/current/${category}.json?api-key=${NYT_API_KEY}`,
  ).then((data) => data.results?.books || []);
}

function getHighResCover(imageLinks) {
  if (!imageLinks) return null;

  return (
    imageLinks.extraLarge ||
    imageLinks.large ||
    imageLinks.medium ||
    imageLinks.thumbnail ||
    imageLinks.smallThumbnail ||
    null
  );
}

const formatGoogleBook = (book, isbn) => ({
  id: isbn,
  mediaType: "books",
  title: book.title || null,
  summary: book.description || "No summary available.",
  releaseYear: book.publishedDate?.slice(0, 4) || null,
  coverUrl: getHighResCover(book.imageLinks),
  rating:
    typeof book.averageRating === "number"
      ? Math.round(book.averageRating * 20) / 10
      : null,
  creators: book.authors?.join(", ") || null,
  genres: book.categories || [],
  pageCount: book.pageCount || null,
});

const formatNYTBookFallback = (book) => ({
  id: book.primary_isbn13 || `nyt-${book.title}`,
  mediaType: "books",
  title: book.title || null,
  summary: book.description || "No summary available.",
  releaseYear: book.published_date?.slice(0, 4) || null,
  coverUrl: book.book_image || null,
  rating: null,
  creators: book.author || null,
  genres: [],
  pageCount: null,
});

async function fetchGoogleBookByISBN(isbn) {
  if (!isbn) return null;

  if (googleBooksCache.has(isbn)) {
    return googleBooksCache.get(isbn);
  }

  try {
    const data = await fetchJSON(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${GOOGLE_API_KEY}&maxResults=1`,
    );

    if (!data.items?.length) return null;

    const formatted = formatGoogleBook(data.items[0].volumeInfo, isbn);

    googleBooksCache.set(isbn, formatted);

    return formatted;
  } catch (err) {
    console.warn("fetchGoogleBookByISBN error:", err);
    return null;
  }
}

async function enrichBookWithGoogle(nytBook) {
  const isbn = nytBook.primary_isbn13;

  try {
    const googleData = await fetchGoogleBookByISBN(isbn);

    if (googleData) {
      const merged = {
        ...googleData,
        coverUrl: nytBook.book_image || googleData.coverUrl || null,
      };

      googleBooksCache.set(isbn, merged);
      return merged;
    }
  } catch (err) {
    console.warn("Google enrichment failed:", err);
  }

  const fallback = formatNYTBookFallback(nytBook);
  googleBooksCache.set(fallback.id, fallback);

  return fallback;
}

function getUniqueBooks(books) {
  const unique = new Set();

  return books.filter((book) => {
    const key = book.primary_isbn13 || book.title?.toLowerCase();
    if (!key || unique.has(key)) return false;
    unique.add(key);
    return true;
  });
}

function shuffleArray(array) {
  let currentIndex = array.length,
    randomIndex;

  // while there remain elements to shuffle
  while (currentIndex !== 0) {
    // pick a remaining element
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // and swap it with the current element
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export const getBooksByList = async (req, res) => {
  const { listName } = req.params;

  if (!listName) {
    return res.status(400).json({ error: "Missing listName parameter" });
  }

  const now = Date.now();
  const cached = booksByListCache.get(listName);

  if (cached && now - cached.timestamp < BOOKS_BY_LIST_CACHE_DURATION) {
    return res.json(cached.data);
  }

  try {
    const nytBooks = await fetchNYTList(listName);
    const formatted = await Promise.all(
      nytBooks.slice(0, 20).map(enrichBookWithGoogle),
    );

    booksByListCache.set(listName, { data: formatted, timestamp: now });

    res.json(formatted);
  } catch (error) {
    console.error("getBooksByList error:", error);

    if (cached) {
      console.warn(`Returning stale cache for list "${listName}" due to error`);
      return res.json(cached.data);
    }

    return res.status(500).json({ error: "Failed to fetch books for list." });
  }
};

export const getTrendingBooks = async (req, res) => {
  const now = Date.now();

  if (
    trendingBooksCache &&
    now - trendingBooksTimestamp < TRENDING_CACHE_DURATION
  ) {
    return res.json(trendingBooksCache);
  }

  try {
    const categories = [
      "hardcover-fiction",
      "hardcover-nonfiction",
      "combined-print-and-e-book-fiction",
      "combined-print-and-e-book-nonfiction",
    ];

    const nytResults = await Promise.allSettled(categories.map(fetchNYTList));

    const allBooks = nytResults
      .filter((r) => r.status === "fulfilled")
      .flatMap((r) => r.value);

    const uniqueBooks = getUniqueBooks(allBooks);
    const shuffled = shuffleArray(uniqueBooks).slice(0, 30);

    const enriched = await Promise.all(shuffled.map(enrichBookWithGoogle));

    trendingBooksCache = enriched;
    trendingBooksTimestamp = now;

    res.json(enriched);
  } catch (err) {
    console.error("getTrendingBooks error:", err);

    if (trendingBooksCache) {
      console.warn("Returning stale trending books cache due to error");
      return res.json(trendingBooksCache);
    }

    return res.status(500).json({ error: "Failed to fetch trending books." });
  }
};

export const getBookResults = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Missing 'query' parameter" });
  }

  try {
    const data = await fetchJSON(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query,
      )}&key=${GOOGLE_API_KEY}&maxResults=10`,
    );

    const formatted =
      data.items
        ?.map((item) => {
          const identifiers = item.volumeInfo?.industryIdentifiers || [];

          const isbn =
            identifiers.find((id) => id.type === "ISBN_13")?.identifier ||
            identifiers.find((id) => id.type === "ISBN_10")?.identifier;

          if (!isbn) return null;

          const bookData = formatGoogleBook(item.volumeInfo, isbn);

          googleBooksCache.set(isbn, bookData);

          return bookData;
        })
        .filter(Boolean) || [];

    res.json(formatted);
  } catch (err) {
    console.error("getBookResults error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch book search results" });
  }
};

export const getBookDetails = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Missing book ID" });
  }

  try {
    if (googleBooksCache.has(id)) {
      const cached = googleBooksCache.get(id);

      syncMedia(cached).catch((err) => console.error("syncMedia error:", err));

      return res.json(cached);
    }

    const looksLikeISBN = /^\d{10}(\d{3})?$/.test(id);

    if (looksLikeISBN) {
      const googleBook = await fetchGoogleBookByISBN(id);

      if (googleBook) {
        syncMedia(googleBook).catch((err) =>
          console.error("syncMedia error:", err),
        );

        return res.json(googleBook);
      }
    }

    const dbMedia = await findMediaByExternalId(id, "books");

    if (dbMedia) {
      const formatted = {
        id: dbMedia.external_id,
        mediaType: "books",
        title: dbMedia.title,
        summary: dbMedia.summary,
        releaseYear: dbMedia.release_year,
        coverUrl: dbMedia.image_url,
        rating: null,
        creators: null,
        genres: [],
        pageCount: null,
      };

      googleBooksCache.set(id, formatted);
      return res.json(formatted);
    }

    res.status(404).json({ error: "Book not found" });
  } catch (err) {
    console.error("getBookDetails error:", err);
    return res.status(500).json({ error: "Failed to fetch book details." });
  }
};
