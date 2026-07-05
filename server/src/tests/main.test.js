import request from "supertest";
import app from "../app.js";

describe("GET /api/test", () => {
  it("returns the test message", async () => {
    const response = await request(app).get("/api/test");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Server test route is working.",
    });
  });
});
