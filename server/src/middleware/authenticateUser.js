import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config/env.js";

export function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log(`authHeader looks like ${authHeader}`);
  const token = authHeader && authHeader.split(" ")[1];
  console.log(`The access token looks like ${token}`);
  if (!token || token === "undefined") {
    return res.status(401).json({
      error: "Sorry, you are unauthorized from performing this action.",
    });
  }

  try {
    const user = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = user;
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Sorry, you have an invalid or expired token." });
  }
}
