import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GiGameConsole } from "react-icons/gi";
import { GiTv } from "react-icons/gi";
import { GiBlackBook } from "react-icons/gi";
import { GiFilmStrip } from "react-icons/gi";
import { API_BASE_URL } from "../config/env";
import Loading from "../components/Loading";
import "./Account.css";

const Account = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccountStats = async () => {
      if (!auth.user) return;

      setLoading(true);

      const baseUrl = `${API_BASE_URL}/api/auth/account`;

      try {
        const response = await fetchWithAuth(
          baseUrl,
          {
            method: "GET",
          },
          auth,
        );
        const data = await response.json();

        setStats(data);
      } catch (err) {
        toast.error(err.message, {
          id: "main",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAccountStats();
  }, [auth.user]);

  const handleClick = async (e) => {
    e.preventDefault();
    if (!stats?.email) return;

    setSendingReset(true);

    try {
      await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: stats.email }),
      });

      toast.success("A reset link has been sent to your email.", {
        id: "main",
      });
    } catch (err) {
      toast.error("Something went wrong. Please try again.", {
        id: "main",
      });
    } finally {
      setSendingReset(false);
    }
  };

  const handleLogout = () => {
    auth.logout("manual");
    toast.success("Logged out successfully!", {
      id: "main",
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (!stats)
    return (
      <main className="account-page">
        <section className="account-card">
          <h1 className="account__title">No account data found.</h1>
        </section>
      </main>
    );

  return (
    <main className="account-page">
      <section className="account-card">
        <h1 className="account__title">Account</h1>

        <section className="account__section">
          <h2 className="account__subtitle">Personal Information</h2>
          <div className="account__info">
            <p>
              <span>Username: </span>
              <strong>{auth.user.username}</strong>
            </p>

            <p>
              <span>Email: </span>
              <strong>{stats.email}</strong>
            </p>
          </div>
        </section>

        <hr className="gradient-divider" />

        <section className="account__section">
          <h2 className="account__subtitle">Journal Stats</h2>

          <div className="account__total">
            <span>Total Entries</span>
            <h3>{stats.total}</h3>
          </div>

          <ul className="account__stats">
            <li>
              <span>
                <GiFilmStrip /> Movies
              </span>
              <strong>{stats.movie}</strong>
            </li>
            <li>
              <span>
                <GiTv /> TV
              </span>
              <strong>{stats.tv}</strong>
            </li>
            <li>
              <span>
                <GiBlackBook /> Books
              </span>
              <strong>{stats.books}</strong>
            </li>
            <li>
              <span>
                <GiGameConsole /> Games
              </span>
              <strong>{stats.games}</strong>
            </li>
          </ul>
        </section>

        <hr className="gradient-divider" />

        <section className="account__section">
          <h2 className="account__subtitle">Account Actions</h2>

          <div className="account__action">
            <div className="account__action-text">
              <span className="account__action-title">Reset Password</span>
              <span className="account__action-desc">
                We’ll send a secure reset link to your email
              </span>
            </div>

            <button
              onClick={handleClick}
              className="btn btn-ghost account__reset"
              disabled={sendingReset}
            >
              {sendingReset ? "Sending..." : "Reset Password"}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="btn btn-danger account__logout"
          >
            Logout
          </button>
        </section>
      </section>
    </main>
  );
};

export default Account;
