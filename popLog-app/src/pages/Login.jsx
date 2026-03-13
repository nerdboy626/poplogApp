import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
import toast from "react-hot-toast";
import "./Login.css";

const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;
  const redirectPath =
    sessionStorage.getItem("redirectAfterLogin") || location.state?.from || "/";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signUpError, setSignUpError] = useState("");

  useEffect(() => {
    if (auth.logoutReason === "expired") {
      toast.error("Your session expired. Please log in again.");
    }
  }, [auth.logoutReason]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("http://localhost:3500/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || "Login failed");
        return;
      }

      // store user + token in context/localStorage
      auth.login({ ...data.user, token: data.accessToken });
      toast.success("Welcome back!");
      navigate(redirectPath, { replace: true });
      sessionStorage.removeItem("redirectAfterLogin");
    } catch (err) {
      console.error("Login error: ", err);
      setLoginError("Something went wrong. Please try again.");
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setSignUpError("");

    try {
      const res = await fetch("http://localhost:3500/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSignUpError(data.error || "Signup failed");
        return;
      }

      // store user + token in context/localStorage
      auth.login({ ...data.user, token: data.accessToken });
      toast.success("Account created! We're happy to have you here!");
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Signup error: ", err);
      setSignUpError("Something went wrong. Please try again.");
    }
  };
  return (
    <div className="login-page">
      {message && <div className="login-info-message">{message}</div>}
      <div className="login-card">
        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">Sign in to continue to PopLog</p>

        <button
          className="btn btn-ghost google-btn"
          onClick={() => {
            window.location.href = "http://localhost:3500/api/auth/google";
          }}
        >
          <img
            src="./google.svg"
            alt=""
            className="google-icon"
            aria-hidden="true"
          />
          Continue with Google
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <form className="form-container" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit">
            Login
          </button>
        </form>

        {loginError && <p className="error-text">{loginError}</p>}

        <Link className="forgot-link" to="/forgot-password">
          Forgot your password?
        </Link>

        <hr className="gradient-divider" />

        <h4 className="signup-title">New to PopLog?</h4>

        <form className="form-container" onSubmit={handleSignUp}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-accent" type="submit">
            Create account
          </button>
        </form>

        {signUpError && <p className="error-text">{signUpError}</p>}
      </div>
    </div>
  );
};

export default Login;
