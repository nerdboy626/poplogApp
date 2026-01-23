import express from "express";
import {
  postNewUser,
  loginUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

export const authRouter = express.Router();

authRouter.post("/signup", postNewUser);
authRouter.post("/login", loginUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
