import express from "express";
import { getGameResults } from "../controllers/gamesController.js";

export const gameRouter = express.Router();

gameRouter.get("/search", getGameResults);
