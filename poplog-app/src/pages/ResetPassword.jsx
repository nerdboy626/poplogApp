import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import toast from "react-hot-toast";
import "./ResetPassword.css";
import { API_BASE_URL } from "../config/env";

const ResetPassword = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (password !== confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Reset failed");
        return;
      }

      toast.success("Password reset successful.", {
        id: "main",
      });
      if (auth.user) {
        navigate("/account");
      } else {
        navigate("/login");
      }
    } catch (err) {
      console.error("Login error: ", err);
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="reset-page">
        <section className="reset-card">
          <h1 className="reset-card__title">Invalid reset link</h1>
          <p className="reset-card__subtitle">
            This password reset link is missing or expired.
          </p>
          <p className="reset-card__footer">
            {auth.user ? (
              <Link to="/account">Go to your account</Link>
            ) : (
              <Link to="/forgot-password">Request a new link</Link>
            )}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="reset-page">
      <section className="reset-card">
        <h1 className="reset-card__title">Reset your password</h1>
        <p className="reset-card__subtitle">
          Choose a new password for your account
        </p>

        <form className="reset-form" onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
            required
          />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        {passwordError && <p className="reset-form__error">{passwordError}</p>}

        <p className="reset-card__footer">
          Changed your mind?{" "}
          {auth.user ? (
            <Link to="/account">Go to your account</Link>
          ) : (
            <Link to="/forgot-password">Request a new link</Link>
          )}
        </p>
      </section>
    </main>
  );
};

export default ResetPassword;
