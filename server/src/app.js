import express from "express";
import cors from "cors";
import { PORT, FRONTEND_URL } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { movieRouter } from "./routes/movies.js";
import { bookRouter } from "./routes/books.js";
import { gameRouter } from "./routes/games.js";
import { reviewRouter } from "./routes/reviews.js";
import "./utils/googleStrategy.js";

const app = express();

const allowedOrigins = ["http://localhost:3000", FRONTEND_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/movies", movieRouter);
app.use("/api/books", bookRouter);
app.use("/api/games", gameRouter);
app.use("/api/reviews", reviewRouter);

app.get("/api/test", (req, res) => {
  res.json({ message: "Server test route is working." });
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found." });
});

app.listen(PORT, () => {
  console.log(`Server is connected to port ${PORT}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});
