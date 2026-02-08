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
} from "../database/authQueries.js";
import { sendResetEmail } from "../utils/email.js";
import { ACCESS_TOKEN_SECRET } from "../config/env.js";

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

  try {
    const users = await userExists(username, email);

    console.log(users.length);

    if (users.length != 0) {
      return res
        .status(400)
        .json({ error: "Email or username already in use." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await insertUser(username, email, hashed);

    console.log("User registered!");

    const jwtUser = { id: user.id, username: user.username };

    const accessToken = jwt.sign(jwtUser, ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({
      message: "User registered successfully",
      user,
      accessToken,
    });
  } catch (err) {
    console.error("Registration error:", err.message);
    return res
      .status(500)
      .json({ error: "Registration failed. Please try again." });
  }
};

export const loginUser = async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  email = email.trim().toLowerCase();

  try {
    const users = await getUserByEmail(email);

    if (users.length == 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (users[0].hashed_password == null) {
      return res.status(400).json({
        error: "This account uses OAuth. Please sign in with Google.",
      });
    }

    const isValid = await bcrypt.compare(password, users[0].hashed_password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = { id: users[0].id, username: users[0].username };

    const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    console.log("Logged In!");
    res.status(200).json({
      message: "Login successful",
      user,
      accessToken,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
};

function generateResetToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  return { token, tokenHash };
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ message: "If the account exists, an email was sent." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const users = await getUserByEmail(normalizedEmail);

  if (users.length === 0 || users[0].hashed_password === null) {
    // OAuth-only users don't need password reset
    return res
      .status(200)
      .json({ message: "If the account exists, an email was sent." });
  }

  const { token, tokenHash } = generateResetToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

  await createPasswordResetToken(users[0].id, tokenHash, expiresAt);

  await sendResetEmail(normalizedEmail, token);

  res.json({ message: "If the account exists, an email was sent." });
};

export const resetPassword = async (req, res) => {
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

  const hashedPassword = await bcrypt.hash(password, 10);

  await updateUserPassword(resetToken.user_id, hashedPassword);
  await deleteAllPasswordResetTokens(resetToken.user_id);

  res.json({ message: "Password reset successful." });
};
