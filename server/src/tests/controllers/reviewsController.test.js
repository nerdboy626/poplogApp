import {
  upsertReview,
  deleteReview,
  getDashboardItems,
  getReviewQuery,
} from "../../database/reviewQueries.js";

import {
  findOrCreateMedia,
  findMediaByExternalId,
} from "../../database/mediaQueries.js";

import {
  saveReview,
  deleteUserReview,
  getUserDashboard,
  getUserReview,
} from "../../controllers/reviewsController.js";
import { use } from "passport";

vi.mock("../../database/reviewQueries.js", () => ({
  upsertReview: vi.fn(),
  deleteReview: vi.fn(),
  getDashboardItems: vi.fn(),
  getReviewQuery: vi.fn(),
}));

vi.mock("../../database/mediaQueries.js", () => ({
  findOrCreateMedia: vi.fn(),
  findMediaByExternalId: vi.fn(),
}));

describe("reviewsController", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { id: 1 },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.clearAllMocks();
  });

  describe("saveReview", () => {
    it("should save a review successfully", async () => {
      req.body = {
        id: 26,
        mediaType: "movie",
        title: "Awesome Movie",
        summary: "Awesome plot and characters.",
        releaseYear: 2020,
        coverUrl: "http://example.com/awesome-movie.jpg",
        rating: 10,
        favorite: true,
        notes: "I loved the storyline!",
      };

      findOrCreateMedia.mockResolvedValue({ id: 15 });
      upsertReview.mockResolvedValue({
        id: 8,
        user_id: 1,
        media_id: 15,
        rating: 10,
        favorite: true,
        notes: "I loved the storyline!",
      });

      await saveReview(req, res);

      expect(findOrCreateMedia).toHaveBeenCalledWith({
        id: 26,
        mediaType: "movie",
        title: "Awesome Movie",
        summary: "Awesome plot and characters.",
        releaseYear: 2020,
        coverUrl: "http://example.com/awesome-movie.jpg",
      });

      expect(upsertReview).toHaveBeenCalledWith({
        user_id: 1,
        media_id: 15,
        rating: 10,
        favorite: true,
        notes: "I loved the storyline!",
      });

      expect(res.json).toHaveBeenCalledWith({
        id: 8,
        user_id: 1,
        media_id: 15,
        rating: 10,
        favorite: true,
        notes: "I loved the storyline!",
      });
    });

    it("should return 500 if saving the review fails", async () => {
      req.body = {
        id: 26,
        mediaType: "movie",
        title: "Awesome Movie",
        summary: "Awesome plot and characters.",
        releaseYear: 2020,
        coverUrl: "http://example.com/awesome-movie.jpg",
        rating: 10,
        favorite: true,
        notes: "I loved the storyline!",
      };

      findOrCreateMedia.mockRejectedValue(new Error("Database error"));

      await saveReview(req, res);

      expect(findOrCreateMedia).toHaveBeenCalled();

      expect(upsertReview).not.toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/fail/i),
        }),
      );
    });
  });

  describe("deleteUserReview", () => {
    it("should delete a review successfully", async () => {
      req.params = {
        mediaId: 15,
      };

      deleteReview.mockResolvedValue(1);

      await deleteUserReview(req, res);

      expect(deleteReview).toHaveBeenCalledWith(1, 15);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/success/i),
        }),
      );
    });

    it("should return 404 if the review does not exist", async () => {
      req.params = {
        mediaId: 15,
      };

      deleteReview.mockResolvedValue(0);

      await deleteUserReview(req, res);

      expect(deleteReview).toHaveBeenCalledWith(1, 15);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/not found/i),
        }),
      );
    });

    it("should return 500 if deleting the review fails", async () => {
      req.params = {
        mediaId: 15,
      };

      deleteReview.mockRejectedValue(new Error("Database error"));

      await deleteUserReview(req, res);

      expect(deleteReview).toHaveBeenCalledWith(1, 15);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/fail/i),
        }),
      );
    });
  });

  describe("getUserDashboard", () => {
    it("should return the user's dashboard items", async () => {
      const dashboardItems = [
        {
          media_id: 1,
          external_id: 26,
          title: "Awesome Movie",
          summary: "Awesome plot and characters.",
          media_type: "movie",
          release_year: 2020,
          image_url: "http://example.com/awesome-movie.jpg",
          rating: 10,
          favorite: true,
          notes: "I loved the storyline!",
          created_at: "2025-01-01T00:00:00.000Z",
        },
        {
          media_id: 2,
          external_id: 57,
          title: "Another Movie",
          summary: "Another summary.",
          media_type: "movie",
          release_year: 2022,
          image_url: "http://example.com/another-movie.jpg",
          rating: 8,
          favorite: false,
          notes: "Pretty good.",
          created_at: "2025-02-01T00:00:00.000Z",
        },
      ];

      getDashboardItems.mockResolvedValue(dashboardItems);

      await getUserDashboard(req, res);

      expect(getDashboardItems).toHaveBeenCalledWith(1);

      expect(res.json).toHaveBeenCalledWith(dashboardItems);

      expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 500 if retrieving dashboard items fails", async () => {
      getDashboardItems.mockRejectedValue(new Error("Database error"));

      await getUserDashboard(req, res);

      expect(getDashboardItems).toHaveBeenCalledWith(1);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/fail/i),
        }),
      );
    });
  });

  describe("getUserReview", () => {
    it("should return null if the media does not exist", async () => {
      req.params = {
        mediaType: "movie",
        externalId: 26,
      };

      findMediaByExternalId.mockResolvedValue(null);

      await getUserReview(req, res);

      expect(findMediaByExternalId).toHaveBeenCalledWith(26, "movie");

      expect(getReviewQuery).not.toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith(null);
    });

    it("should return null if the user does not have a review for the media", async () => {
      req.params = {
        mediaType: "movie",
        externalId: 26,
      };

      findMediaByExternalId.mockResolvedValue({
        id: 15,
        external_id: 26,
        media_type: "movie",
        title: "Awesome Movie",
        summary: "Awesome plot and characters.",
        releaseYear: 2020,
        coverUrl: "http://example.com/awesome-movie.jpg",
      });

      getReviewQuery.mockResolvedValue(null);

      await getUserReview(req, res);

      expect(findMediaByExternalId).toHaveBeenCalledWith(26, "movie");

      expect(getReviewQuery).toHaveBeenCalledWith(1, 15);

      expect(res.json).toHaveBeenCalledWith(null);
    });

    it("should return the user's review successfully", async () => {
      req.params = {
        mediaType: "movie",
        externalId: 26,
      };

      findMediaByExternalId.mockResolvedValue({
        id: 15,
        external_id: 26,
        media_type: "movie",
        title: "Awesome Movie",
        summary: "Awesome plot and characters.",
        releaseYear: 2020,
        coverUrl: "http://example.com/awesome-movie.jpg",
      });

      getReviewQuery.mockResolvedValue({
        rating: 10,
        favorite: true,
        notes: "Great movie!",
      });

      await getUserReview(req, res);

      expect(findMediaByExternalId).toHaveBeenCalledWith(26, "movie");

      expect(getReviewQuery).toHaveBeenCalledWith(1, 15);

      expect(res.json).toHaveBeenCalledWith({
        mediaId: 15,
        rating: 10,
        favorite: true,
        notes: "Great movie!",
      });
    });
  });
});
