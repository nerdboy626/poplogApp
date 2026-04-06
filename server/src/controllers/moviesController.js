import fetch from "node-fetch";
import { syncMedia } from "../utils/syncMedia.js";
import { TMDB_ACCESS_TOKEN } from "../config/env.js";

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`,
  },
};

const TRENDING_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

let movieGenresMap = {};
let tvGenresMap = {};

let trendingShowsCache = null;
let trendingMoviesCache = null;

let trendingShowsTimestamp = 0;
let trendingMoviesTimestamp = 0;

const byGenreCache = new Map();
const BY_GENRE_CACHE_DURATION = 24 * 60 * 60 * 1000;

const fetchTMDB = async (url) => {
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TMDB API error: ${response.status} - ${errorText}`);
  }

  return response.json();
};

const fetchMovieAndTVGenres = async () => {
  try {
    const [movieData, tvData] = await Promise.all([
      fetchTMDB("https://api.themoviedb.org/3/genre/movie/list?language=en-US"),
      fetchTMDB("https://api.themoviedb.org/3/genre/tv/list?language=en-US"),
    ]);

    movieGenresMap = movieData.genres.reduce((acc, genre) => {
      acc[genre.id] = genre.name;
      return acc;
    }, {});

    tvGenresMap = tvData.genres.reduce((acc, genre) => {
      acc[genre.id] = genre.name;
      return acc;
    }, {});
  } catch (err) {
    console.error("fetchMovieAndTVGenres error:", err);
  }
};

const ensureGenresLoaded = async () => {
  if (Object.keys(movieGenresMap).length === 0) {
    await fetchMovieAndTVGenres();
  }
};

const getTitle = (item) =>
  item.media_type === "movie" ? item.title : item.name;

const getReleaseYear = (item) =>
  (item.media_type === "movie"
    ? item.release_date
    : item.first_air_date
  )?.slice(0, 4) || null;

const getGenres = (item) => {
  const map = item.media_type === "movie" ? movieGenresMap : tvGenresMap;
  return item.genre_ids?.map((id) => map[id]).filter(Boolean) || [];
};

const normalizeMediaType = (items, type) =>
  items.map((item) => ({ ...item, media_type: type }));

function formatData(data) {
  return data.map((item) => ({
    id: item.id,
    mediaType: item.media_type,
    title: getTitle(item),
    summary: item.overview || "No summary available.",
    releaseYear: getReleaseYear(item),
    coverUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,
    backdropUrl: item.backdrop_path
      ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
      : null,
    rating:
      typeof item.vote_average === "number"
        ? Math.round(item.vote_average * 10) / 10
        : null,
    genres: getGenres(item),
  }));
}

function formatRuntime(minutes) {
  if (!minutes || typeof minutes !== "number") return null;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;

  return `${hours}h ${mins}m`;
}

const unifiedGenres = {
  action: { movie: 28, tv: 10759, label: "Action & Adventure" },
  animation: { movie: 16, tv: 16, label: "Animation" },
  comedy: { movie: 35, tv: 35, label: "Comedy" },
  crime: { movie: 80, tv: 80, label: "Crime" },
  documentary: { movie: 99, tv: 99, label: "Documentary" },
  drama: { movie: 18, tv: 18, label: "Drama" },
  family: { movie: 10751, tv: 10751, label: "Family" },
  fantasy: { movie: "14,878", tv: 10765, label: "Fantasy / Sci-Fi" },
  mystery: { movie: 9648, tv: 9648, label: "Mystery" },
  war: { movie: 10752, tv: 10768, label: "War & Politics" },
  western: { movie: 37, tv: 37, label: "Western" },
};

export const getByGenre = async (req, res) => {
  const { genreId } = req.params;

  if (!genreId) {
    return res.status(400).json({ error: "Missing 'genreId' parameter" });
  }

  const genrePair = unifiedGenres[genreId.toLowerCase()];
  if (!genrePair) {
    return res.status(400).json({ error: `Invalid genre '${genreId}'` });
  }

  const now = Date.now();
  const cached = byGenreCache.get(genreId.toLowerCase());

  if (cached && now - cached.timestamp < BY_GENRE_CACHE_DURATION) {
    return res.json(cached.data);
  }

  try {
    await ensureGenresLoaded();

    const [moviesData, tvData] = await Promise.all([
      fetchTMDB(
        `https://api.themoviedb.org/3/discover/movie?with_genres=${genrePair.movie}&sort_by=popularity.desc&language=en-US`,
      ),
      fetchTMDB(
        `https://api.themoviedb.org/3/discover/tv?with_genres=${genrePair.tv}&sort_by=popularity.desc&language=en-US`,
      ),
    ]);

    const movies = normalizeMediaType(moviesData.results || [], "movie");
    const shows = normalizeMediaType(tvData.results || [], "tv");

    const combined = [...movies, ...shows]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 30);

    const formatted = formatData(combined);

    byGenreCache.set(genreId.toLowerCase(), {
      data: formatted,
      timestamp: now,
    });

    res.json(formatted);
  } catch (err) {
    console.error("getByGenre error:", err);

    if (cached) {
      console.warn(`Returning stale cache for genre "${genreId}" due to error`);
      return res.json(cached.data);
    }

    return res.status(500).json({ error: "Failed to fetch genre results" });
  }
};

export const getTrendingShows = async (req, res) => {
  const now = Date.now();

  if (
    trendingShowsCache &&
    now - trendingShowsTimestamp < TRENDING_CACHE_DURATION
  ) {
    return res.json(trendingShowsCache);
  }

  try {
    await ensureGenresLoaded();
    const data = await fetchTMDB(
      "https://api.themoviedb.org/3/trending/tv/week?language=en-US",
    );

    const results = data.results || [];
    const formatted = formatData(results.slice(0, 30));

    trendingShowsCache = formatted;
    trendingShowsTimestamp = now;

    res.json(formatted);
  } catch (err) {
    console.error("getTrendingShows error:", err);

    if (trendingShowsCache) {
      console.warn("Returning stale trending shows cache");
      return res.json(trendingShowsCache);
    }

    return res.status(500).json({ error: "Failed to fetch trending shows" });
  }
};

export const getTrendingMovies = async (req, res) => {
  const now = Date.now();

  if (
    trendingMoviesCache &&
    now - trendingMoviesTimestamp < TRENDING_CACHE_DURATION
  ) {
    return res.json(trendingMoviesCache);
  }

  try {
    await ensureGenresLoaded();

    const data = await fetchTMDB(
      "https://api.themoviedb.org/3/trending/movie/week?language=en-US",
    );

    const results = data.results || [];
    const formatted = formatData(results.slice(0, 30));

    trendingMoviesCache = formatted;
    trendingMoviesTimestamp = now;

    res.json(formatted);
  } catch (err) {
    console.error("getTrendingMovies error:", err);

    if (trendingMoviesCache) {
      console.warn("Returning stale trending movies cache");
      return res.json(trendingMoviesCache);
    }

    return res.status(500).json({ error: "Failed to fetch trending movies" });
  }
};

export const getTMDBResults = async (req, res) => {
  const { query, page = 1 } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Missing 'query' parameter" });
  }

  try {
    await ensureGenresLoaded();

    const params = new URLSearchParams({
      query,
      include_adult: "false",
      language: "en-US",
      page: page.toString(),
    });

    const data = await fetchTMDB(
      `https://api.themoviedb.org/3/search/multi?${params.toString()}`,
    );

    const filtered = data.results.filter(
      (item) => item.media_type === "movie" || item.media_type === "tv",
    );

    res.json(formatData(filtered));
  } catch (err) {
    console.error("getTMDBResults error:", err);
    return res
      .status(500)
      .json({ error: "Failed to fetch movie search results" });
  }
};

export const getTMDBDetailsById = async (req, res) => {
  const { mediaType, id } = req.params;

  if (!id || !mediaType) {
    return res
      .status(400)
      .json({ error: "Missing 'id' or 'mediaType' parameter" });
  }

  if (mediaType !== "movie" && mediaType !== "tv") {
    return res.status(400).json({
      error: "Invalid mediaType. Must be 'movie' or 'tv'.",
    });
  }

  try {
    const data = await fetchTMDB(
      `https://api.themoviedb.org/3/${mediaType}/${id}?append_to_response=credits`,
    );

    const mainCast =
      data.credits?.cast?.slice(0, 6).map((actor) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profileUrl: actor.profile_path
          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
          : null,
      })) || [];

    let creators = null;

    if (mediaType === "tv") {
      creators = data.created_by?.length
        ? data.created_by.map((c) => c.name).join(", ")
        : null;
    } else {
      creators =
        data.credits?.crew
          ?.filter((p) => p.job === "Director")
          .map((d) => d.name)
          .join(", ") || null;
    }

    const formatted = {
      id: data.id,
      mediaType,
      title: mediaType === "movie" ? data.title : data.name,
      summary: data.overview || "No summary available.",
      releaseYear:
        (mediaType === "movie"
          ? data.release_date
          : data.first_air_date
        )?.slice(0, 4) || null,
      coverUrl: data.poster_path
        ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
        : null,
      backdropUrl: data.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
        : null,
      rating:
        typeof data.vote_average === "number"
          ? Math.round(data.vote_average * 10) / 10
          : null,
      genres: data.genres?.map((g) => g.name) || [],
      productionCompanies: data.production_companies || [],
      creators,
      cast: mainCast,
      ...(mediaType === "tv" && {
        numberOfSeasons: data.number_of_seasons || null,
        numberOfEpisodes: data.number_of_episodes || null,
        episodeRuntime: Array.isArray(data.episode_run_time)
          ? formatRuntime(data.episode_run_time[0])
          : null,
      }),
      ...(mediaType === "movie" && {
        runtime: formatRuntime(data.runtime) || null,
      }),
    };

    syncMedia(formatted).catch((err) => {
      console.error("syncMedia error:", err);
    });

    res.json(formatted);
  } catch (err) {
    console.error("getTMDBDetailsById error:", err);
    return res.status(500).json({ error: "Failed to fetch TMDB details" });
  }
};
