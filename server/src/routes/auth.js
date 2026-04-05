import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  postNewUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getAccountInfo,
} from "../controllers/authController.js";
import { ACCESS_TOKEN_SECRET, FRONTEND_URL } from "../config/env.js";
import { authenticateUser } from "../middleware/authenticateUser.js";

export const authRouter = express.Router();

// email and password
authRouter.post("/signup", postNewUser);
authRouter.post("/login", loginUser);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.get("/account", authenticateUser, getAccountInfo);

// Google OAuth
authRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login`,
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, username: req.user.username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" },
    );

    res.redirect(`${FRONTEND_URL}/oauth-success?token=${token}`);
  },
);
