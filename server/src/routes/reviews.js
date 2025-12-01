import express from "express";
import { authenticateUser } from "../middleware/authenticateUser.js";
import {
  saveReview,
  deleteUserReview,
  getUserDashboard,
} from "../controllers/reviewsController.js";

export const reviewRouter = express.Router();

reviewRouter.post("/save", authenticateUser, saveReview);
reviewRouter.delete("/delete/:mediaId", authenticateUser, deleteUserReview);
reviewRouter.get("/dashboard", authenticateUser, getUserDashboard);
