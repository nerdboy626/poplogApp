import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from "crypto";
import {
  userExists,
  insertUser,
  getUserByEmail,
  createPasswordResetToken,
  getPasswordResetToken,
  deleteAllPasswordResetTokens,
  updateUserPassword,
  getUserById,
} from "../database/authQueries.js";
import { getDashboardItems } from "../database/reviewQueries.js";
import { sendResetEmail } from "../utils/email.js";
import { ACCESS_TOKEN_SECRET } from "../config/env.js";

export const loginUser = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  email = email.trim().toLowerCase();

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.hashed_password == null) {
      return res.status(400).json({
        error: "This account uses OAuth. Please sign in with Google.",
      });
    }

    const isValid = await bcrypt.compare(password, user.hashed_password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const userInfo = { id: user.id, username: user.username };

    const accessToken = jwt.sign(userInfo, ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      user: userInfo,
      accessToken,
    });
  } catch (err) {
    console.error("loginUser error:", err.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
};

export const postNewUser = async (req, res) => {
  let { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  email = email.trim().toLowerCase();
  username = username.trim();

  if (!/^[a-zA-Z0-9_-]{1,32}$/.test(username)) {
    return res.status(400).json({
      error:
        "Username must be 1-32 characters, using letters, numbers, _ or -.",
    });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters and include one uppercase letter, one lowercase letter, and one number.",
    });
  }

  try {
    const users = await userExists(username, email);

    if (users.length !== 0) {
      return res
        .status(400)
        .json({ error: "Email or username already in use." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await insertUser(username, email, hashed);

    const userInfo = { id: user.id, username: user.username };

    const accessToken = jwt.sign(userInfo, ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User registered successfully",
      user: userInfo,
      accessToken,
    });
  } catch (err) {
    console.error("postNewUser error:", err.message);
    return res
      .status(500)
      .json({ error: "Registration failed. Please try again." });
  }
};

function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  return { token, tokenHash };
}

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(200)
        .json({ message: "If the account exists, an email was sent." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await getUserByEmail(normalizedEmail);

    if (!user || user.hashed_password === null) {
      // OAuth-only users don't need password reset
      return res
        .status(200)
        .json({ message: "If the account exists, an email was sent." });
    }

    await deleteAllPasswordResetTokens(user.id);

    const { token, tokenHash } = generateResetToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    await createPasswordResetToken(user.id, tokenHash, expiresAt);

    await sendResetEmail(normalizedEmail, token);

    res.json({ message: "If the account exists, an email was sent." });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "Invalid request." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await getPasswordResetToken(tokenHash);

    if (!resetToken) {
      return res.status(400).json({
        error:
          "Token is invalid or expired. Please send a new reset password email.",
      });
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include one uppercase letter, one lowercase letter, and one number.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await updateUserPassword(resetToken.user_id, hashedPassword);
    await deleteAllPasswordResetTokens(resetToken.user_id);

    res.json({ message: "Password reset successful." });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

export async function getAccountInfo(req, res) {
  try {
    const userId = req.user.id;

    const [reviews, user] = await Promise.all([
      getDashboardItems(userId),
      getUserById(userId),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const stats = {
      email: user.email,
      total: reviews.length,
      movie: 0,
      tv: 0,
      books: 0,
      games: 0,
    };

    for (const r of reviews) {
      if (stats[r.media_type] !== undefined) {
        stats[r.media_type]++;
      }
    }

    res.json(stats);
  } catch (err) {
    console.error("getAccountInfo error:", err);
    res.status(500).json({ error: "Failed to load account info" });
  }
}
