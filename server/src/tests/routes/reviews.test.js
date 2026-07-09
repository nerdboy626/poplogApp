import express from "express";
import request from "supertest";

import { reviewRouter } from "../../routes/reviews.js";

import {
  saveReview,
  deleteUserReview,
  getUserDashboard,
  getUserReview,
} from "../../controllers/reviewsController.js";

vi.mock("../../middleware/authenticateUser.js", () => ({
  authenticateUser: vi.fn((req, res, next) => {
    req.user = { id: 1 };
    next();
  }),
}));

vi.mock("../../controllers/reviewsController.js", () => ({
  saveReview: vi.fn((req, res) => {
    res.json({ message: "saveReview called" });
  }),

  deleteUserReview: vi.fn((req, res) => {
    res.json({ message: "deleteUserReview called" });
  }),

  getUserDashboard: vi.fn((req, res) => {
    res.json({ message: "getUserDashboard called" });
  }),

  getUserReview: vi.fn((req, res) => {
    res.json({ message: "getUserReview called" });
  }),
}));

describe("reviews routes", () => {
  let app;

  beforeEach(() => {
    app = express();

    app.use(express.json());

    app.use("/api/reviews", reviewRouter);

    vi.clearAllMocks();
  });

  it("should route POST /save to saveReview controller", async () => {
    const response = await request(app).post("/api/reviews/save").send({
      id: 26,
      mediaType: "movie",
      title: "Awesome Movie",
    });

    expect(saveReview).toHaveBeenCalled();

    expect(response.body).toEqual({
      message: "saveReview called",
    });
  });

  it("should route DELETE /delete/:mediaId to deleteUserReview controller", async () => {
    const response = await request(app).delete("/api/reviews/delete/15");

    expect(deleteUserReview).toHaveBeenCalled();

    expect(response.body).toEqual({
      message: "deleteUserReview called",
    });
  });

  it("should route GET /dashboard to getUserDashboard controller", async () => {
    const response = await request(app).get("/api/reviews/dashboard");

    expect(getUserDashboard).toHaveBeenCalled();

    expect(response.body).toEqual({
      message: "getUserDashboard called",
    });
  });

  it("should route GET /:mediaType/:externalId to getUserReview controller", async () => {
    const response = await request(app).get("/api/reviews/movie/26");

    expect(getUserReview).toHaveBeenCalled();

    expect(response.body).toEqual({
      message: "getUserReview called",
    });
  });
});
