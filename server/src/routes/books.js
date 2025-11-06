import express from "express";
import {
  getBookResults,
  getTrendingBooks,
} from "../controllers/booksController.js";

export const bookRouter = express.Router();

bookRouter.get("/search", getBookResults);
bookRouter.get("/trending", getTrendingBooks);
