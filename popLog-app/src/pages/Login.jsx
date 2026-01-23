import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
import toast from "react-hot-toast";

const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath =
    sessionStorage.getItem("redirectAfterLogin") || location.state?.path || "/";

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (auth.logoutReason === "expired") {
      toast.error("Your session expired. Please log in again.");
    }
  }, [auth.logoutReason]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

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
        setError(data.error || "Login failed");
        return;
      }

      // store user + token in context/localStorage
      auth.login({ ...data.user, token: data.accessToken });
      toast.success("Welcome back!");
      navigate(redirectPath, { replace: true });
      sessionStorage.removeItem("redirectAfterLogin");
    } catch (err) {
      console.error("Login error: ", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3500/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      // store user + token in context/localStorage
      auth.login({ ...data.user, token: data.accessToken });
      toast.success("Account created! We're happy to have you here!");
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Signup error: ", err);
      setError("Something went wrong. Please try again.");
    }
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <h1>Login Page</h1>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Login</button>
      </form>
      <p>
        <Link to="/forgot-password">Forgot your password?</Link>
      </p>
      <h4>Don't have an account? Then Sign Up here:</h4>
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        <button type="submit">Sign Up</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Login;
