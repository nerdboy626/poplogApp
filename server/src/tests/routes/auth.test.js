import request from "supertest";
import express from "express";

import { authRouter } from "../../routes/auth.js";

import {
  postNewUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getAccountInfo,
} from "../../controllers/authController.js";

import { authenticateUser } from "../../middleware/authenticateUser.js";

vi.mock("../../controllers/authController.js", () => ({
  postNewUser: vi.fn((req, res) => res.status(201).json({ message: "signup" })),

  loginUser: vi.fn((req, res) => res.status(200).json({ message: "login" })),

  forgotPassword: vi.fn((req, res) => res.json({ message: "forgot password" })),

  resetPassword: vi.fn((req, res) => res.json({ message: "reset password" })),

  getAccountInfo: vi.fn((req, res) => res.json({ message: "account" })),
}));

vi.mock("../../middleware/authenticateUser.js", () => ({
  authenticateUser: vi.fn((req, res, next) => {
    next();
  }),
}));

vi.mock("passport", () => ({
  default: {
    authenticate: vi.fn(() => (req, res, next) => {
      next();
    }),
  },
}));

describe("auth routes", () => {
  let app;

  beforeEach(() => {
    app = express();

    app.use(express.json());

    app.use("/api/auth", authRouter);

    vi.clearAllMocks();
  });

  it("should route POST /signup to postNewUser controller", async () => {
    await request(app).post("/api/auth/signup").send({
      username: "Nico",
      email: "user@example.com",
      password: "Password123",
    });

    expect(postNewUser).toHaveBeenCalled();
  });

  it("should route POST /login to loginUser controller", async () => {
    await request(app).post("/api/auth/login").send({
      email: "user@example.com",
      password: "Password123",
    });

    expect(loginUser).toHaveBeenCalled();
  });

  it("should route POST /forgot-password to forgotPassword controller", async () => {
    await request(app).post("/api/auth/forgot-password").send({
      email: "user@example.com",
    });

    expect(forgotPassword).toHaveBeenCalled();
  });

  it("should route POST /reset-password to resetPassword controller", async () => {
    await request(app).post("/api/auth/reset-password").send({
      token: "token",
      password: "Password123",
    });

    expect(resetPassword).toHaveBeenCalled();
  });

  it("should route GET /account through authentication middleware", async () => {
    await request(app).get("/api/auth/account");

    expect(authenticateUser).toHaveBeenCalled();

    expect(getAccountInfo).toHaveBeenCalled();
  });
});
