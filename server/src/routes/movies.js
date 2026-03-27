import express from "express";
import {
  getTrendingShows,
  getTrendingMovies,
  getTMDBResults,
  getByGenre,
  getTMDBDetailsById,
} from "../controllers/moviesController.js";

export const movieRouter = express.Router();

movieRouter.get("/trending/movies", getTrendingMovies);
movieRouter.get("/trending/shows", getTrendingShows);
movieRouter.get("/search", getTMDBResults);
movieRouter.get("/genre/:genreId", getByGenre);
movieRouter.get("/details/:mediaType/:id", getTMDBDetailsById);
