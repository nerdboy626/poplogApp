import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import toast from "react-hot-toast";
import "./ResetPassword.css";

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
      const res = await fetch("http://localhost:3500/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Reset failed");
        return;
      }

      toast.success("Password reset successful.");
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
      <div className="reset-page">
        <div className="reset-card">
          <h1 className="reset-title">Invalid reset link</h1>
          <p className="reset-subtitle">
            This password reset link is missing or expired.
          </p>
          {auth.user ? (
            <Link className="request-link" to="/account">
              Go to your account
            </Link>
          ) : (
            <Link className="request-link" to="/forgot-password">
              Request a new link
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="reset-page">
      <div className="reset-card">
        <h1 className="reset-title">Reset your password</h1>
        <p className="reset-subtitle">Choose a new password for your account</p>

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

        <p className="reset-back">
          Changed your mind?{" "}
          {auth.user ? (
            <Link className="request-link" to="/account">
              Go to your account
            </Link>
          ) : (
            <Link className="request-link" to="/forgot-password">
              Request a new link
            </Link>
          )}
        </p>

        {passwordError && <p className="error-text">{passwordError}</p>}
      </div>
    </div>
  );
};

export default ResetPassword;
