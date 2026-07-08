import { ACCESS_TOKEN_SECRET } from "../../config/env.js";
import jwt from "jsonwebtoken";
import { authenticateUser } from "../../middleware/authenticateUser.js";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

describe("authenticateUser middleware", () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      headers: {},
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    next = vi.fn();

    vi.clearAllMocks();
  });

  it("should return 401 if no token is provided", () => {
    authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringMatching(/unauthorized/i),
      }),
    );

    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when the token is "undefined"', () => {
    req.headers.authorization = "Bearer undefined";

    authenticateUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringMatching(/unauthorized/i),
      }),
    );

    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if the JWT is invalid", () => {
    req.headers.authorization = "Bearer fake-token";

    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authenticateUser(req, res, next);

    expect(jwt.verify).toHaveBeenCalled();

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringMatching(/invalid or expired/i),
      }),
    );

    expect(next).not.toHaveBeenCalled();
  });

  it("should add the decoded user to req.user and call next()", () => {
    const user = {
      id: 1,
      username: "Nico",
    };

    req.headers.authorization = "Bearer valid-token";

    jwt.verify.mockReturnValue(user);

    authenticateUser(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", ACCESS_TOKEN_SECRET);

    expect(req.user).toEqual(user);

    expect(next).toHaveBeenCalled();

    expect(res.status).not.toHaveBeenCalled();

    expect(res.json).not.toHaveBeenCalled();
  });
});
