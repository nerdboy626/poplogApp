import { useEffect, useState } from "react";
import { useAuth } from "../utils/AuthContext";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
          <p>
            <strong>Username:</strong> {auth.user.username}
          </p>
          <p>
            <strong>Email:</strong> {stats.email}
          </p>
        </section>

        <hr />

        <section>
          <h2>Review Stats</h2>
          <p>
            <strong>Total reviews:</strong> {stats.total}
          </p>

          <ul>
            <li>Movies: {stats.movies}</li>
            <li>TV: {stats.tv}</li>
            <li>Books: {stats.books}</li>
            <li>Games: {stats.games}</li>
          </ul>
        </section>

        <hr />

        <section>
          <p>Forgot password?</p>
          <button
            onClick={handleClick}
            className="btn btn-ghost"
            disabled={sendingReset}
          >
            {sendingReset ? "Sending..." : "Send reset link"}
          </button>
        </section>

        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Account;
