import express from "express";
import {
  getTrendingMovies,
  getMovieResults,
} from "../controllers/moviesController.js";

export const movieRouter = express.Router();

movieRouter.get("/trending", getTrendingMovies);
movieRouter.get("/search", getMovieResults);
