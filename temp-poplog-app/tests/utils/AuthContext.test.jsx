import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "../../src/utils/AuthContext";
import { jwtDecode } from "jwt-decode";

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

function TestComponent() {
  const { user, isLoggedIn, loading, login, logout, logoutReason } = useAuth();

  return (
    <>
      <div data-testid="loading">{String(loading)}</div>

      <div data-testid="logged-in">{String(isLoggedIn)}</div>

      <div data-testid="user">{user ? JSON.stringify(user) : "null"}</div>

      <div data-testid="logout-reason">{logoutReason ?? "null"}</div>

      <button
        onClick={() =>
          login({
            username: "Nico",
            token: "valid-token",
          })
        }
      >
        Login
      </button>

      <button onClick={() => logout()}>Logout</button>

      <button onClick={() => logout("expired")}>Expired Logout</button>
    </>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("should start with no user when localStorage is empty", async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("false"),
      );

      expect(screen.getByTestId("logged-in")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent("null");
    });

    it("should restore a valid stored user", async () => {
      const storedUser = {
        username: "Nico",
        token: "valid-token",
      };

      localStorage.setItem("user", JSON.stringify(storedUser));

      jwtDecode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("false"),
      );

      expect(jwtDecode).toHaveBeenCalledWith("valid-token");

      expect(screen.getByTestId("logged-in")).toHaveTextContent("true");
      expect(screen.getByTestId("user")).toHaveTextContent("Nico");
    });

    it("should log the user out when the stored token is expired", async () => {
      const storedUser = {
        username: "Nico",
        token: "expired-token",
      };

      localStorage.setItem("user", JSON.stringify(storedUser));

      jwtDecode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) - 3600,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("false"),
      );

      expect(jwtDecode).toHaveBeenCalledWith("expired-token");

      expect(screen.getByTestId("logged-in")).toHaveTextContent("false");
      expect(screen.getByTestId("user")).toHaveTextContent("null");
      expect(localStorage.getItem("user")).toBeNull();
    });

    it("should log the user out if the stored user has no token", async () => {
      const storedUser = {
        username: "Nico",
      };

      localStorage.setItem("user", JSON.stringify(storedUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("false"),
      );

      expect(screen.getByTestId("logged-in")).toHaveTextContent("false");
      expect(localStorage.getItem("user")).toBeNull();
    });

    it("should log the user out if stored JSON is invalid", async () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      localStorage.setItem("user", "{bad json");

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("loading")).toHaveTextContent("false"),
      );

      expect(errorSpy).toHaveBeenCalledWith(
        "Auth init error:",
        expect.any(SyntaxError),
      );

      expect(screen.getByTestId("logged-in")).toHaveTextContent("false");
      expect(localStorage.getItem("user")).toBeNull();

      errorSpy.mockRestore();
    });
  });

  describe("login", () => {
    it("should login a user and store them in localStorage", async () => {
      const user = userEvent.setup();

      jwtDecode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await user.click(screen.getByText("Login"));

      expect(screen.getByTestId("logged-in")).toHaveTextContent("true");

      expect(screen.getByTestId("user")).toHaveTextContent("Nico");

      expect(localStorage.getItem("user")).toEqual(
        JSON.stringify({
          username: "Nico",
          token: "valid-token",
        }),
      );

      expect(jwtDecode).toHaveBeenCalledWith("valid-token");
    });

    it("should logout if login receives an invalid token", async () => {
      const user = userEvent.setup();

      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      jwtDecode.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await user.click(screen.getByText("Login"));

      expect(screen.getByTestId("logged-in")).toHaveTextContent("false");

      expect(screen.getByTestId("user")).toHaveTextContent("null");

      expect(localStorage.getItem("user")).toBeNull();

      expect(errorSpy).toHaveBeenCalledWith(
        "Login decode error:",
        expect.any(Error),
      );

      errorSpy.mockRestore();
    });
  });

  describe("logout", () => {
    it("should remove user data and clear search cache", async () => {
      const user = userEvent.setup();

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: "Nico",
          token: "valid-token",
        }),
      );

      localStorage.setItem(
        "searchCache",
        JSON.stringify({
          movies: [],
        }),
      );

      jwtDecode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await waitFor(() =>
        expect(screen.getByTestId("logged-in")).toHaveTextContent("true"),
      );

      await user.click(screen.getByText("Logout"));

      expect(screen.getByTestId("logged-in")).toHaveTextContent("false");

      expect(screen.getByTestId("user")).toHaveTextContent("null");

      expect(localStorage.getItem("user")).toBeNull();

      expect(localStorage.getItem("searchCache")).toBeNull();
    });

    it("should store logout reason when provided", async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      await user.click(screen.getByText("Expired Logout"));

      expect(screen.getByTestId("logout-reason")).toHaveTextContent("expired");
    });
  });

  describe("auto logout", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should automatically logout when token expires", () => {
      jwtDecode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 1,
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );

      fireEvent.click(screen.getByText("Login"));

      expect(screen.getByTestId("logged-in")).toHaveTextContent("true");

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId("logged-in")).toHaveTextContent("false");
      expect(screen.getByTestId("logout-reason")).toHaveTextContent("expired");
      expect(localStorage.getItem("user")).toBeNull();
    });
  });
});
