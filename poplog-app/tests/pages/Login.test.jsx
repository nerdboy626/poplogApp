import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import toast from "react-hot-toast";
import Login from "../../src/pages/Login.jsx";

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      pathname: "/login",
      state: {},
    }),
  };
});

vi.mock("../../src/utils/useAuth.js", () => ({
  useAuth: () => ({
    login: mockLogin,
    logoutReason: null,
  }),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("rendering", () => {
    it("should render both login and signup forms", () => {
      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      expect(screen.getByLabelText("Login email")).toBeInTheDocument();
      expect(screen.getByLabelText("Login password")).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /log in/i }),
      ).toBeInTheDocument();

      expect(
        screen.getByRole("link", {
          name: /password/i,
        }),
      ).toBeInTheDocument();

      expect(screen.getByLabelText("Signup username")).toBeInTheDocument();
      expect(screen.getByLabelText("Signup email")).toBeInTheDocument();
      expect(screen.getByLabelText("Signup password")).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /create account/i }),
      ).toBeInTheDocument();
    });
  });

  describe("login flow", () => {
    it("should log the user in successfully", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          user: {
            id: 1,
            username: "Nico",
          },
          accessToken: "valid-token",
        }),
      });

      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      await user.type(screen.getByLabelText("Login email"), "user@example.com");
      await user.type(screen.getByLabelText("Login password"), "Password123");

      await user.click(
        screen.getByRole("button", {
          name: /log in/i,
        }),
      );

      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
        expect(mockLogin).toHaveBeenCalledWith({
          id: 1,
          username: "Nico",
          token: "valid-token",
        });

        expect(toast.success).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it("should show login error from the backend", async () => {
      fetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "Invalid credentials",
        }),
      });

      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      await user.type(
        screen.getByLabelText("Login email"),
        "invalid@example.com",
      );
      await user.type(
        screen.getByLabelText("Login password"),
        "invalidpassword",
      );

      await user.click(
        screen.getByRole("button", {
          name: /log in/i,
        }),
      );

      expect(
        await screen.findByText("Invalid credentials"),
      ).toBeInTheDocument();

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it("should show a generic login error when fetch fails", async () => {
      fetch.mockRejectedValue(new Error("Internal server error"));

      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      await user.type(screen.getByLabelText("Login email"), "user@example.com");
      await user.type(screen.getByLabelText("Login password"), "Password123");

      await user.click(
        screen.getByRole("button", {
          name: /log in/i,
        }),
      );

      expect(await screen.findByText(/wrong/i)).toBeInTheDocument();
    });
  });

  describe("signup flow", () => {
    it("should create an account successfully", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          user: {
            id: 5,
            username: "Nico",
          },
          accessToken: "valid-token",
        }),
      });

      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      await user.type(screen.getByLabelText("Signup username"), "Nico");
      await user.type(
        screen.getByLabelText("Signup email"),
        "user@example.com",
      );
      await user.type(screen.getByLabelText("Signup password"), "Password123");

      await user.click(
        screen.getByRole("button", {
          name: /create account/i,
        }),
      );

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it("should show signup error from the backend", async () => {
      fetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          error: "Email or username already in use.",
        }),
      });

      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      await user.type(screen.getByLabelText("Signup username"), "Nico");
      await user.type(
        screen.getByLabelText("Signup email"),
        "user@example.com",
      );
      await user.type(screen.getByLabelText("Signup password"), "Password123");

      await user.click(
        screen.getByRole("button", {
          name: /create account/i,
        }),
      );

      expect(
        await screen.findByText("Email or username already in use."),
      ).toBeInTheDocument();
    });

    it("should show a generic signup error when fetch fails", async () => {
      fetch.mockRejectedValue(new Error("Internal server error"));

      const user = userEvent.setup();

      render(
        <MemoryRouter>
          <Login />
        </MemoryRouter>,
      );

      await user.type(screen.getByLabelText("Signup username"), "Nico");
      await user.type(
        screen.getByLabelText("Signup email"),
        "user@example.com",
      );
      await user.type(screen.getByLabelText("Signup password"), "Password123");

      await user.click(
        screen.getByRole("button", {
          name: /create account/i,
        }),
      );

      expect(await screen.findByText(/wrong/i)).toBeInTheDocument();
    });
  });
});
