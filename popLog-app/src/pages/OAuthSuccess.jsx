import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import "./OAuthSuccess.css";

const OAuthSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      const decoded = jwtDecode(token);

      auth.login({
        id: decoded.id,
        username: decoded.username,
        token,
      });

      navigate("/", { replace: true });
    } else {
      toast.error("Login with Google failed.");
      navigate("/login", { replace: true });
    }
  }, []);

  return (
    <div className="oauth-success">
      <div className="oauth-card">
        <div className="spinner" />
        <p>Signing you in…</p>
      </div>
    </div>
  );
};

export default OAuthSuccess;
