import express from "express";
import {
  getBookResults,
  getTrendingBooks,
  getBooksByList,
  getBookDetails,
} from "../controllers/booksController.js";

export const bookRouter = express.Router();

bookRouter.get("/search", getBookResults);
bookRouter.get("/genre/:listName", getBooksByList);
bookRouter.get("/trending", getTrendingBooks);
bookRouter.get("/details/:id", getBookDetails);
