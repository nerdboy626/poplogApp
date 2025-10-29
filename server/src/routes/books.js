import express from "express";
import { getBookResults } from "../controllers/booksController.js";

export const bookRouter = express.Router();

bookRouter.get("/search", getBookResults);
