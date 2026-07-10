import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import PublicRoute from "../../src/routes/PublicRoute.jsx";
import { useAuth } from "../../src/utils/AuthContext.jsx";

vi.mock("../../src/utils/AuthContext.jsx", () => ({
  useAuth: vi.fn(),
}));

const renderWithRouter = (authValue, initialEntry = "/login") => {
  useAuth.mockReturnValue(authValue);

  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <h1>Login Page</h1>
            </PublicRoute>
          }
        />

        <Route path="/account" element={<h1>Account Page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("PublicRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when user is logged out", () => {
    renderWithRouter({
      isLoggedIn: false,
      loading: false,
    });

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("should render nothing while auth is loading", () => {
    useAuth.mockReturnValue({
      isLoggedIn: false,
      loading: true,
    });

    const { container } = render(
      <MemoryRouter>
        <PublicRoute>
          <h1>Login Page</h1>
        </PublicRoute>
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("should redirect logged in users to /account by default", () => {
    renderWithRouter({
      isLoggedIn: true,
      loading: false,
    });

    expect(screen.getByText("Account Page")).toBeInTheDocument();

    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  it("should redirect logged in users to the saved route", () => {
    useAuth.mockReturnValue({
      isLoggedIn: true,
      loading: false,
    });

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/login",
            state: {
              from: "/journal",
            },
          },
        ]}
      >
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <h1>Login Page</h1>
              </PublicRoute>
            }
          />

          <Route path="/journal" element={<h1>Journal Page</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Journal Page")).toBeInTheDocument();
  });
});
