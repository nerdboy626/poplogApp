import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import {
  getUserByEmail,
  userExists,
  insertUser,
  createPasswordResetToken,
  getPasswordResetToken,
  deleteAllPasswordResetTokens,
  updateUserPassword,
  getUserById,
} from "../../src/database/authQueries.js";

import { getDashboardItems } from "../../src/database/reviewQueries.js";
import { sendResetEmail } from "../../src/utils/email.js";
import { generateResetToken } from "../../src/utils/token.js";

import {
  loginUser,
  postNewUser,
  forgotPassword,
  resetPassword,
  getAccountInfo,
} from "../../src/controllers/authController.js";

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

vi.mock("../../src/database/authQueries.js", () => ({
  getUserByEmail: vi.fn(),
  userExists: vi.fn(),
  insertUser: vi.fn(),
  createPasswordResetToken: vi.fn(),
  getPasswordResetToken: vi.fn(),
  deleteAllPasswordResetTokens: vi.fn(),
  updateUserPassword: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock("../../src/utils/email.js", () => ({
  sendResetEmail: vi.fn(),
}));

vi.mock("../../src/utils/token.js", () => ({
  generateResetToken: vi.fn(),
}));

vi.mock("../../src/database/reviewQueries.js", () => ({
  getDashboardItems: vi.fn(),
}));

describe("authController", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    vi.clearAllMocks();
  });

  describe("loginUser", () => {
    it("should return 400 if email is missing", async () => {
      req.body = { password: "Password123" };
      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/required/i),
        }),
      );
    });

    it("should return 400 if password is missing", async () => {
      req.body = { email: "user@example.com" };
      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 401 if user is not found", async () => {
      req.body = { email: "  USER@Example.com ", password: "Password123" };

      getUserByEmail.mockResolvedValue(null);

      await loginUser(req, res);

      expect(getUserByEmail).toHaveBeenCalledWith("user@example.com");

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/invalid/i),
        }),
      );
    });

    it("should return 400 if user has account through OAuth", async () => {
      req.body = { email: "user@example.com ", password: "Password123" };

      getUserByEmail.mockResolvedValue({
        hashed_password: null,
      });

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/oauth/i),
        }),
      );
    });

    it("should return 401 if password is incorrect", async () => {
      req.body = { email: "user@example.com ", password: "Password123" };

      getUserByEmail.mockResolvedValue({
        id: 1,
        username: "Nico",
        hashed_password: "hashed-password",
      });

      bcrypt.compare.mockResolvedValue(false);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/invalid/i),
        }),
      );
    });

    it("should return user info with access token on successful login", async () => {
      req.body = { email: "user@example.com ", password: "Password123" };

      getUserByEmail.mockResolvedValue({
        id: 1,
        username: "Nico",
        hashed_password: "hashed-password",
      });

      bcrypt.compare.mockResolvedValue(true);

      jwt.sign.mockReturnValue("fake-token");

      await loginUser(req, res);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "Password123",
        "hashed-password",
      );

      expect(jwt.sign).toHaveBeenCalled();

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/success/i),
          user: {
            id: 1,
            username: "Nico",
          },
          accessToken: "fake-token",
        }),
      );
    });
  });

  describe("postNewUser", () => {
    it("should return 400 if username is missing", async () => {
      req.body = {
        email: "user@example.com",
        password: "Password123",
      };

      await postNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/required/i),
        }),
      );
    });

    it("should return 400 if email is missing", async () => {
      req.body = {
        username: "Nico",
        password: "Password123",
      };

      await postNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if password is missing", async () => {
      req.body = {
        username: "Nico",
        email: "user@example.com",
      };

      await postNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 for an invalid username", async () => {
      req.body = {
        username: "nico!",
        email: "user@example.com",
        password: "Password123",
      };

      await postNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/username/i),
        }),
      );
    });

    it("should return 400 for an invalid email", async () => {
      req.body = {
        username: "Nico",
        email: "bad-email",
        password: "Password123",
      };

      await postNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/invalid/i),
        }),
      );
    });

    it("should return 400 for a weak password", async () => {
      req.body = {
        username: "Nico",
        email: "user@example.com",
        password: "password123",
      };

      await postNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/password must/i),
        }),
      );
    });

    it("should return 400 if username or email already exists", async () => {
      req.body = {
        username: "Nico",
        email: "USER@example.com ",
        password: "Password123",
      };

      userExists.mockResolvedValue([{ id: 1 }]);

      await postNewUser(req, res);

      expect(userExists).toHaveBeenCalledWith("Nico", "user@example.com");

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/already/i),
        }),
      );
    });

    it("should create a new user and return an access token", async () => {
      req.body = {
        username: " Nico ",
        email: " USER@example.com ",
        password: "Password123",
      };

      userExists.mockResolvedValue([]);

      bcrypt.hash.mockResolvedValue("hashed-password");

      insertUser.mockResolvedValue({
        id: 1,
        username: "Nico",
      });

      jwt.sign.mockReturnValue("fake-token");

      await postNewUser(req, res);

      expect(userExists).toHaveBeenCalledWith("Nico", "user@example.com");

      expect(bcrypt.hash).toHaveBeenCalledWith("Password123", 10);

      expect(insertUser).toHaveBeenCalledWith(
        "Nico",
        "user@example.com",
        "hashed-password",
      );

      expect(jwt.sign).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/success/i),
          user: {
            id: 1,
            username: "Nico",
          },
          accessToken: "fake-token",
        }),
      );
    });

    it("should return 500 if the database throws an error", async () => {
      req.body = {
        username: "Nico",
        email: "user@example.com",
        password: "Password123",
      };

      userExists.mockRejectedValue(new Error("Database error"));

      await postNewUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/failed/i),
        }),
      );
    });
  });

  describe("forgotPassword", () => {
    it("should return a message if email is missing", async () => {
      req.body = {};

      await forgotPassword(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/sent/i),
        }),
      );

      expect(getUserByEmail).not.toHaveBeenCalled();
      expect(sendResetEmail).not.toHaveBeenCalled();
    });

    it("should return a message if user does not exist", async () => {
      req.body = {
        email: "USER@example.com ",
      };

      getUserByEmail.mockResolvedValue(null);

      await forgotPassword(req, res);

      expect(getUserByEmail).toHaveBeenCalledWith("user@example.com");

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/sent/i),
        }),
      );

      expect(deleteAllPasswordResetTokens).not.toHaveBeenCalled();
      expect(sendResetEmail).not.toHaveBeenCalled();
    });

    it("should return a message if user only has an OAuth account", async () => {
      req.body = {
        email: "user@example.com",
      };

      getUserByEmail.mockResolvedValue({
        id: 1,
        email: "user@example.com",
        hashed_password: null,
      });

      await forgotPassword(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/sent/i),
        }),
      );

      expect(deleteAllPasswordResetTokens).not.toHaveBeenCalled();
      expect(sendResetEmail).not.toHaveBeenCalled();
    });

    it("should create a password reset token and send email successfully", async () => {
      req.body = {
        email: " USER@example.com ",
      };

      getUserByEmail.mockResolvedValue({
        id: 1,
        email: "user@example.com",
        hashed_password: "hashed-password",
      });

      generateResetToken.mockReturnValue({
        token: "plain-token",
        tokenHash: "hashed-token",
      });

      await forgotPassword(req, res);

      expect(getUserByEmail).toHaveBeenCalledWith("user@example.com");

      expect(deleteAllPasswordResetTokens).toHaveBeenCalledWith(1);

      expect(generateResetToken).toHaveBeenCalled();

      expect(createPasswordResetToken).toHaveBeenCalledWith(
        1,
        "hashed-token",
        expect.any(Date),
      );

      expect(sendResetEmail).toHaveBeenCalledWith(
        "user@example.com",
        "plain-token",
      );

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/sent/i),
        }),
      );
    });

    it("should return 500 if an error occurs", async () => {
      req.body = {
        email: "user@example.com",
      };

      getUserByEmail.mockRejectedValue(new Error("Database error"));

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/wrong/i),
        }),
      );
    });
  });

  describe("resetPassword", () => {
    it("should return 400 if token is missing", async () => {
      req.body = {
        password: "Password123",
      };

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/invalid/i),
        }),
      );

      expect(getPasswordResetToken).not.toHaveBeenCalled();
    });

    it("should return 400 if password is missing", async () => {
      req.body = {
        token: "reset-token",
      };

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 400 if reset token is invalid or expired", async () => {
      req.body = {
        token: "bad-token",
        password: "Password123",
      };

      getPasswordResetToken.mockResolvedValue(null);

      await resetPassword(req, res);

      expect(getPasswordResetToken).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/invalid or expired/i),
        }),
      );

      expect(updateUserPassword).not.toHaveBeenCalled();
    });

    it("should return 400 if password does not meet requirements", async () => {
      req.body = {
        token: "valid-token",
        password: "password123",
      };

      getPasswordResetToken.mockResolvedValue({
        user_id: 1,
      });

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/password/i),
        }),
      );

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(updateUserPassword).not.toHaveBeenCalled();
    });

    it("should update the password and delete reset tokens successfully", async () => {
      req.body = {
        token: "valid-token",
        password: "Password123",
      };

      getPasswordResetToken.mockResolvedValue({
        user_id: 1,
      });

      bcrypt.hash.mockResolvedValue("hashed-password");

      await resetPassword(req, res);

      const expectedHash = crypto
        .createHash("sha256")
        .update("valid-token")
        .digest("hex");

      expect(getPasswordResetToken).toHaveBeenCalledWith(expectedHash);

      expect(bcrypt.hash).toHaveBeenCalledWith("Password123", 10);

      expect(updateUserPassword).toHaveBeenCalledWith(1, "hashed-password");

      expect(deleteAllPasswordResetTokens).toHaveBeenCalledWith(1);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringMatching(/success/i),
        }),
      );
    });

    it("should return 500 if an error occurs", async () => {
      req.body = {
        token: "valid-token",
        password: "Password123",
      };

      getPasswordResetToken.mockRejectedValue(new Error("Database error"));

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/wrong/i),
        }),
      );
    });
  });

  describe("getAccountInfo", () => {
    it("should return 404 if user does not exist", async () => {
      req.user = {
        id: 1,
      };

      getDashboardItems.mockResolvedValue([]);

      getUserById.mockResolvedValue(null);

      await getAccountInfo(req, res);

      expect(getDashboardItems).toHaveBeenCalledWith(1);

      expect(getUserById).toHaveBeenCalledWith(1);

      expect(res.status).toHaveBeenCalledWith(404);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/not found/i),
        }),
      );
    });

    it("should return user statistics successfully", async () => {
      req.user = {
        id: 1,
      };

      getDashboardItems.mockResolvedValue([
        {
          media_type: "movie",
        },
        {
          media_type: "movie",
        },
        {
          media_type: "tv",
        },
        {
          media_type: "books",
        },
        {
          media_type: "games",
        },
      ]);

      getUserById.mockResolvedValue({
        email: "user@example.com",
      });

      await getAccountInfo(req, res);

      expect(getDashboardItems).toHaveBeenCalledWith(1);

      expect(getUserById).toHaveBeenCalledWith(1);

      expect(res.json).toHaveBeenCalledWith({
        email: "user@example.com",
        total: 5,
        movie: 2,
        tv: 1,
        books: 1,
        games: 1,
      });
    });

    it("should return 500 if an error occurs", async () => {
      req.user = {
        id: 1,
      };

      getDashboardItems.mockRejectedValue(new Error("Database error"));

      await getAccountInfo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/fail/i),
        }),
      );
    });
  });
});
