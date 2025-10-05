import express from "express";
import { PORT } from "./config/env.js";

const app = express();

app.get("/api/test", (req, res) => {
  res.json({ message: "Server test route is working." });
});

app.use("", (req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

app.listen(PORT, () => {
  console.log(`Server is connected to port ${PORT}`);
});
