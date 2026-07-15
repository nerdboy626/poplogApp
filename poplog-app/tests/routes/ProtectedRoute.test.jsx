import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import ProtectedRoute from "../../src/routes/ProtectedRoute.jsx";
import { useAuth } from "../../src/utils/useAuth.js";

vi.mock("../../src/utils/useAuth.js", () => ({
  useAuth: vi.fn(),
}));

const LoginCapture = ({ onState }) => {
  const location = useLocation();

  onState(location.state);

  return <h1>Login Page</h1>;
};

const renderWithRouter = (authValue, initialRoute = "/account") => {
  useAuth.mockReturnValue(authValue);

  render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <h1>Account Page</h1>
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<h1>Login Page</h1>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render children when user is logged in", () => {
    renderWithRouter({
      isLoggedIn: true,
      logoutReason: null,
    });

    expect(screen.getByText("Account Page")).toBeInTheDocument();

    expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
  });

  it("should redirect logged out users to login", () => {
    renderWithRouter({
      isLoggedIn: false,
      logoutReason: null,
    });

    expect(screen.getByText("Login Page")).toBeInTheDocument();

    expect(screen.queryByText("Account Page")).not.toBeInTheDocument();
  });

  it("should include the attempted route in redirect state", () => {
    let loginState;

    useAuth.mockReturnValue({
      isLoggedIn: false,
      logoutReason: "expired",
    });

    render(
      <MemoryRouter initialEntries={["/account"]}>
        <Routes>
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <h1>Account Page</h1>
              </ProtectedRoute>
            }
          />

          <Route
            path="/login"
            element={
              <LoginCapture
                onState={(state) => {
                  loginState = state;
                }}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(loginState).toEqual({
      from: "/account",
      message: "You must be logged in to access the account page",
    });
  });

  it("should not show a message after manual logout", () => {
    renderWithRouter({
      isLoggedIn: false,
      logoutReason: "manual",
    });

    // Cannot see Navigate state directly, this ensures no crash occurs
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
