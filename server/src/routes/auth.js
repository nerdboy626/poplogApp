import express from "express";
import { postNewUser, loginUser } from "../controllers/authController.js";

export const authRouter = express.Router();

authRouter.post("/signup", postNewUser);
authRouter.post("/login", loginUser);
