import express from "express";
import {
  getGameResults,
  getTrendingGames,
} from "../controllers/gamesController.js";

export const gameRouter = express.Router();

gameRouter.get("/search", getGameResults);
gameRouter.get("/trending", getTrendingGames);
