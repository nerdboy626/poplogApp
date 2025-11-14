import express from "express";
import {
  getGameResults,
  getTrendingGames,
  getGameGenres,
  getTrendingGamesByGenre,
} from "../controllers/gamesController.js";

export const gameRouter = express.Router();

gameRouter.get("/search", getGameResults);
gameRouter.get("/trending", getTrendingGames);
gameRouter.get("/genres", getGameGenres);
gameRouter.get("/search/:genreId", getTrendingGamesByGenre);
