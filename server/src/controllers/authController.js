import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import validator from "validator";
import { userExists, insertUser, getUser } from "../database/authQueries.js";
import { ACCESS_TOKEN_SECRET } from "../config/env.js";

export const postNewUser = async (req, res) => {
  let { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  email = email.trim();
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

    const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, {
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
  let { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  username = username.trim();

  try {
    const users = await getUser(username);

    if (users.length == 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, users[0].hashed_password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = { id: users[0].id, username: users[0].username };

    const accessToken = jwt.sign(user, ACCESS_TOKEN_SECRET, {
      expiresIn: "10s",
    });

    console.log("Logged In!");
    res.status(201).json({
      message: "Login successful",
      user,
      accessToken,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
};
