import express from "express";
import {
  getGameResults,
  getTrendingGames,
  getGameGenres,
  getTrendingGamesByGenre,
  getGameDetails,
} from "../controllers/gamesController.js";

export const gameRouter = express.Router();

gameRouter.get("/search", getGameResults);
gameRouter.get("/trending", getTrendingGames);
gameRouter.get("/genres", getGameGenres);
gameRouter.get("/genre/:genreId", getTrendingGamesByGenre);
gameRouter.get("/details/:id", getGameDetails);
