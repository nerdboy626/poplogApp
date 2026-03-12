import fetch from "node-fetch";
import { syncMedia } from "../utils/syncMedia.js";
import { findMediaByExternalId } from "../database/mediaQueries.js";
import { GOOGLE_API_KEY, NYT_API_KEY } from "../config/env.js";

const googleBooksCache = new Map();
let trendingBooksCache = null;
let trendingBooksTimestamp = 0;
const TRENDING_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function fetchNYTList(category) {
  console.log("Fetching NYT list:", category);
  const response = await fetch(
    `https://api.nytimes.com/svc/books/v3/lists/current/${category}.json?api-key=${NYT_API_KEY}`,
  );

  // const body = await response.text();
  // console.log("NYT response body:", body);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NYT API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.results?.books || [];
}

export const getBooksByList = async (req, res) => {
  const { listName } = req.params;

  if (!listName) {
    return res.status(400).json({ error: "Missing listName parameter" });
  }

  try {
    const nytBooks = await fetchNYTList(listName);

    const formatted = await Promise.all(
      nytBooks.slice(0, 20).map(async (book) => {
        try {
          const googleBookData = await fetchGoogleBookByISBN(
            book.primary_isbn13,
          );
          if (googleBookData) {
            const merged = {
              ...googleBookData,
              coverUrl: book.book_image || googleBookData.coverUrl || null,
            };
            googleBooksCache.set(book.primary_isbn13, merged);

            return merged;
          }
        } catch (err) {
          // ignore enrichment errors, fall through to fallback
          console.warn("Google Books enrichment failed:", err);
        }

        const bookId = book.primary_isbn13 || `nyt-${book.title}`;

        const bookData = {
          id: bookId,
          mediaType: "books",
          title: book.title || null,
          summary: book.description || "No summary available.",
          releaseYear: book.published_date?.slice(0, 4) || null,
          coverUrl: book.book_image || null,
          rating: null,
          creators: book.author || null,
          genres: [],
          pageCount: null,
        };

        googleBooksCache.set(bookId, bookData);

        return bookData;
      }),
    );

    res.json(formatted);
  } catch (error) {
    console.error("Server error (getBooksByList):", error);
    res.status(500).json({ error: "Failed to fetch books for list." });
  }
};

function getHighResCover(imageLinks) {
  // if (!imageLinks) return null;
  // const base = imageLinks.thumbnail || imageLinks.smallThumbnail;
  // if (!base) return null;
  // // Try to increase resolution — Google accepts zoom up to 5
  // return base.replace(/zoom=\d+/, "zoom=5");

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

async function fetchGoogleBookByISBN(isbn) {
  if (!isbn) return null;

  if (googleBooksCache.has(isbn)) {
    return googleBooksCache.get(isbn);
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${GOOGLE_API_KEY}&maxResults=1`,
    );

    if (!response.ok) {
      console.log(`Google Books fetch failed for ISBN ${isbn}:`);
      return null;
    }

    const data = await response.json();
    if (!data.items?.length) return null;

    const book = data.items[0].volumeInfo;
    const enriched = {
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
    };

    googleBooksCache.set(isbn, enriched);

    return enriched;
  } catch (err) {
    console.warn("Google Books fetch failed:", err);
    return null;
  }
}

function getUniqueBooks(books) {
  const unique = new Set();
  return books.filter((book) => {
    const key = book.primary_isbn13 || book.title.toLowerCase();
    if (unique.has(key)) return false;
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

export const getTrendingBooks = async (req, res) => {
  const now = Date.now();

  // If cache exists and is less than 24 hours old → return cached data
  if (
    trendingBooksCache &&
    now - trendingBooksTimestamp < TRENDING_CACHE_DURATION
  ) {
    console.log("Serving trending books from cache");
    return res.json(trendingBooksCache);
  }

  try {
    // you can add or remove lists for variety
    const categories = [
      "hardcover-fiction",
      "hardcover-nonfiction",
      "young-adult",
      "advice-how-to-and-miscellaneous",
      "business-books",
      "science",
    ];

    console.log("Fetching trending books from NYT...");

    // fetch all lists in parallel
    const nytResults = await Promise.allSettled(categories.map(fetchNYTList));

    // combine and flatten successful results
    const allBooks = nytResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((list) => list.value);

    // make sure each book only appears once
    const uniqueBooks = getUniqueBooks(allBooks);
    const randomizedBooks = shuffleArray(uniqueBooks);

    // limit to top 30 for performance
    const limitedBooks = randomizedBooks.slice(0, 30);

    console.log(
      `Found ${limitedBooks.length} unique books — enriching with Google data...`,
    );

    // enrich with Google Books info using ISBN
    const enrichedBooks = await Promise.all(
      limitedBooks.map(async (book) => {
        const googleBookData = await fetchGoogleBookByISBN(book.primary_isbn13);

        if (googleBookData) {
          const bookData = {
            ...googleBookData,
            coverUrl: book.book_image || googleBookData.coverUrl || null,
          };

          googleBooksCache.set(book.primary_isbn13, bookData);

          return bookData;
        } else {
          const bookId = book.primary_isbn13 || `nyt-${book.title}`;
          const bookData = {
            id: bookId,
            mediaType: "books",
            title: book.title || null,
            summary: book.description || "No summary available.",
            releaseYear: book.published_date?.slice(0, 4) || null,
            coverUrl: book.book_image || null,
            rating: null,
            creators: book.author ? book.author : null,
            genres: [],
            pageCount: null,
          };

          googleBooksCache.set(bookId, bookData);

          return bookData;
        }
      }),
    );

    console.log("Successfully fetched trending books!");

    trendingBooksCache = enrichedBooks;
    trendingBooksTimestamp = now;

    res.json(enrichedBooks);
  } catch (error) {
    console.error("Server error:", error);

    if (trendingBooksCache) {
      console.warn("Returning stale trending books cache due to error");
      return res.json(trendingBooksCache);
    }

    res.status(500).json({ error: "Failed to fetch trending books." });
  }
};

export const getBookResults = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Missing 'query' parameter" });
  }

  console.log(query);

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      query,
    )}&key=${GOOGLE_API_KEY}&maxResults=10`;

    console.log(`Fetching book results on ${query} ...`);

    const response = await fetch(url);
    const data = await response.json();

    const formattedData =
      data.items
        ?.map((item) => {
          const identifiers = item.volumeInfo?.industryIdentifiers || [];

          const isbn13 = identifiers.find(
            (id) => id.type === "ISBN_13" && id.identifier,
          );
          const isbn10 = identifiers.find(
            (id) => id.type === "ISBN_10" && id.identifier,
          );

          const isbn = isbn13?.identifier || isbn10?.identifier || null;

          // Skip books without valid ISBN
          if (!isbn) return null;

          const bookData = {
            id: isbn,
            mediaType: "books",
            title: item.volumeInfo.title || null,
            summary: item.volumeInfo.description || "No summary available.",
            releaseYear: item.volumeInfo.publishedDate?.slice(0, 4) || null,
            coverUrl: getHighResCover(item.volumeInfo.imageLinks) || null,
            rating:
              typeof item.volumeInfo.averageRating === "number"
                ? Math.round(item.volumeInfo.averageRating * 20) / 10
                : null,
            creators: item.volumeInfo.authors?.join(", ") || null,
            genres: item.volumeInfo.categories || [],
            pageCount: item.volumeInfo.pageCount || null,
          };

          console.log(bookData);

          googleBooksCache.set(isbn, bookData);

          return bookData;
        })
        .filter(Boolean) || [];

    console.log("Successfully obtained book results!");

    res.json(formattedData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch book search results" });
  }
};

export const getBookDetails = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: "Missing book ID" });
  }

  try {
    if (googleBooksCache.has(id)) {
      await syncMedia(googleBooksCache.get(id));
      return res.json(googleBooksCache.get(id));
    }

    const looksLikeISBN = /^\d{10}(\d{3})?$/.test(id);

    if (looksLikeISBN) {
      const googleBook = await fetchGoogleBookByISBN(id);

      if (googleBook) {
        await syncMedia(googleBook);
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

    return res.status(404).json({ error: "Book not found" });
  } catch (err) {
    console.error("Error fetching book details:", err);
    res.status(500).json({ error: "Failed to fetch book details." });
  }
};
