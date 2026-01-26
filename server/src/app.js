import express from "express";
import cors from "cors";
import { PORT } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { movieRouter } from "./routes/movies.js";
import { bookRouter } from "./routes/books.js";
import { gameRouter } from "./routes/games.js";
import { reviewRouter } from "./routes/reviews.js";
import "./utils/googleStrategy.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/movies", movieRouter);
app.use("/api/books", bookRouter);
app.use("/api/games", gameRouter);
app.use("/api/reviews", reviewRouter);

app.get("/api/test", (req, res) => {
  res.json({ message: "Server test route is working." });
});

app.use("", (req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

app.listen(PORT, () => {
  console.log(`Server is connected to port ${PORT}`);
});
