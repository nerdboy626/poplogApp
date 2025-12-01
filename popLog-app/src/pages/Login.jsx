import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";

const Login = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.path || "/";

  const [loginUser, setLoginUser] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3500/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // store user + token in context/localStorage
      auth.login({ ...data.user, token: data.accessToken });
      navigate(redirectPath, { replace: true });
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
          type="text"
          placeholder="Username"
          value={loginUser}
          onChange={(event) => setLoginUser(event.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={loginPassword}
          onChange={(event) => setLoginPassword(event.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <h4>Don't have an account? Then Sign in here:</h4>
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
