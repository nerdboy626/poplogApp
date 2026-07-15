import { fetchWithAuth } from "../../src/utils/fetchWithAuth";

describe("fetchWithAuth", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should include the bearer token in the Authorization header", async () => {
    fetch.mockResolvedValue({
      status: 200,
    });

    const auth = {
      user: {
        token: "valid-token",
      },
      isLoggedIn: true,
      logout: vi.fn(),
    };

    await fetchWithAuth("/api/auth/account", {}, auth);

    expect(fetch).toHaveBeenCalledWith("/api/auth/account", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer valid-token",
      },
    });
  });

  it("should preserve any existing headers", async () => {
    fetch.mockResolvedValue({
      status: 200,
    });

    const auth = {
      user: {
        token: "valid-token",
      },
      isLoggedIn: true,
      logout: vi.fn(),
    };

    await fetchWithAuth(
      "/api/auth/account",
      {
        headers: {
          "X-Test": "testing",
        },
      },
      auth,
    );

    expect(fetch).toHaveBeenCalledWith("/api/auth/account", {
      headers: {
        "Content-Type": "application/json",
        "X-Test": "testing",
        Authorization: "Bearer valid-token",
      },
    });
  });

  it("should log the user out when the response is 401", async () => {
    fetch.mockResolvedValue({
      status: 401,
    });

    const auth = {
      user: {
        token: "valid-token",
      },
      isLoggedIn: true,
      logout: vi.fn(),
    };

    await fetchWithAuth("/api/auth/account", {}, auth);

    expect(auth.logout).toHaveBeenCalledWith("expired");
  });

  it("should not logout if the user is already logged out", async () => {
    fetch.mockResolvedValue({
      status: 401,
    });

    const auth = {
      user: {
        token: "token",
      },
      isLoggedIn: false,
      logout: vi.fn(),
    };

    await fetchWithAuth("/api/auth/account", {}, auth);

    expect(auth.logout).not.toHaveBeenCalled();
  });
});
