import fetch from "node-fetch";
import { GOOGLE_API_KEY, NYT_API_KEY } from "../config/env.js";

async function fetchNYTList(category) {
  const response = await fetch(
    `https://api.nytimes.com/svc/books/v3/lists/current/${category}.json?api-key=${NYT_API_KEY}`
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NYT API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.results?.books || [];
}

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

  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${GOOGLE_API_KEY}&maxResults=1`
  );

  if (!response.ok) {
    console.log(`Google Books fetch failed for ISBN ${book.primary_isbn13}:`);
    return null;
  }

  const data = await response.json();
  if (!data.items?.length) return null;

  const book = data.items[0].volumeInfo;
  return {
    id: data.items[0].id,
    mediaType: "book",
    title: book.title || null,
    summary: book.description || "No summary available.",
    releaseYear: book.publishedDate?.slice(0, 4) || null,
    coverUrl: getHighResCover(book.imageLinks),
    rating:
      typeof book.averageRating === "number"
        ? Math.round(book.averageRating * 20) / 10
        : null,
    authors: book.authors?.join(", ") || null,
    genres: book.categories || [],
  };
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
      `Found ${limitedBooks.length} unique books — enriching with Google data...`
    );

    // enrich with Google Books info using ISBN
    const enrichedBooks = await Promise.all(
      limitedBooks.map(async (book) => {
        const googleBookData = await fetchGoogleBookByISBN(book.primary_isbn13);

        return (
          {
            ...googleBookData,
            coverUrl: book.book_image || googleBookData.coverUrl || null,
          } || {
            id: book.primary_isbn13,
            mediaType: "book",
            title: book.title,
            summary: book.description || "No summary available.",
            releaseYear: book.published_date?.slice(0, 4) || null,
            coverUrl: book.book_image || null,
            rating: null,
            authors: book.author ? book.author : null,
            genres: [],
          }
        );
      })
    );

    console.log("Successfully fetched trending books!");
    res.json(enrichedBooks);
  } catch (error) {
    console.error("Server error:", error);
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
      query
    )}&key=${GOOGLE_API_KEY}&maxResults=10`;

    console.log(`Fetching book results on ${query} ...`);

    const response = await fetch(url);
    const data = await response.json();

    const formattedData =
      data.items?.map((item) => ({
        id: item.id,
        mediaType: "book",
        title: item.volumeInfo.title || null,
        summary: item.volumeInfo.description || "No summary available.",
        releaseYear: item.volumeInfo.publishedDate?.slice(0, 4) || null,
        coverUrl: getHighResCover(item.volumeInfo.imageLinks) || null,
        rating:
          typeof item.volumeInfo.averageRating === "number"
            ? Math.round(item.volumeInfo.averageRating * 20) / 10
            : null,
        authors: item.volumeInfo.authors?.join(", ") || null,
        genres: item.volumeInfo.categories || [],
      })) || [];

    console.log("Successfully obtained book results!");

    res.json(formattedData);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Failed to fetch book search results" });
  }
};
