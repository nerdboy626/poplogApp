import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GiGameConsole } from "react-icons/gi";
import { GiTv } from "react-icons/gi";
import { GiBlackBook } from "react-icons/gi";
import { GiFilmStrip } from "react-icons/gi";

import "./Account.css";

const Account = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    fetchAccountStats();
  }, [auth.user]);

  const fetchAccountStats = async () => {
    if (!auth.user) return;
    const baseUrl = `http://localhost:3500/api/auth/account`;

    try {
      console.log(
        `Trying to grab stats for user ${auth.user.username} with user id of ${auth.user.id}`,
      );

      const response = await fetchWithAuth(
        baseUrl,
        {
          method: "GET",
        },
        auth,
      );
      const data = await response.json();

      console.log(data);

      setStats(data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    if (!stats?.email) return;

    setSendingReset(true);

    try {
      await fetch("http://localhost:3500/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: stats.email }),
      });

      toast.success("A reset link has been sent to your email.");
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSendingReset(false);
    }
  };

  const handleLogout = () => {
    auth.logout("manual");
    toast.success("Logged out successfully!");
    navigate("/login", { replace: true });
  };

  if (loading) return <p>Loading account info...</p>;

  if (!stats) return <p>No account data found.</p>;

  return (
    <div className="account-page">
      <div className="account-card">
        <h1>Account</h1>

        <section>
          <h2>Personal Information</h2>
          <p>
            <strong>Username:</strong> {auth.user.username}
          </p>
          <p>
            <strong>Email:</strong> {stats.email}
          </p>
        </section>

        <hr />

        <section>
          <h2>Journal Stats</h2>

          <div className="total-entries">
            <span>Total Entries</span>
            <h3>{stats.total}</h3>
          </div>

          <ul>
            <li>
              <span className="stat-label">
                <GiFilmStrip /> Movies
              </span>
              <span className="stat-value">{stats.movies}</span>
            </li>
            <li>
              <span className="stat-label">
                <GiTv /> TV
              </span>
              <span className="stat-value">{stats.tv}</span>
            </li>
            <li>
              <span className="stat-label">
                <GiBlackBook /> Books
              </span>
              <span className="stat-value">{stats.books}</span>
            </li>
            <li>
              <span className="stat-label">
                <GiGameConsole /> Games
              </span>
              <span className="stat-value">{stats.games}</span>
            </li>
          </ul>
        </section>

        <hr />

        <section>
          <h2>Account Actions</h2>

          <div className="action-item">
            <div className="action-text">
              <span className="action-label">Reset Password</span>
              <span className="action-description">
                We’ll send a secure reset link to your email
              </span>
            </div>

            <button
              onClick={handleClick}
              className="btn btn-ghost"
              disabled={sendingReset}
            >
              {sendingReset ? "Sending..." : "Reset Password"}
            </button>
          </div>

          <button onClick={handleLogout} className="btn btn-danger">
            Logout
          </button>
        </section>
      </div>
    </div>
  );
};

export default Account;
