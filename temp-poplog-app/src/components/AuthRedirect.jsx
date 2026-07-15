import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";

const AuthRedirect = () => {
  const { isLoggedIn, logoutReason, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (
      !isLoggedIn &&
      logoutReason === "expired" &&
      location.pathname !== "/login" &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;

      const fullPath = location.pathname + location.search + location.hash;

      sessionStorage.setItem("redirectAfterLogin", fullPath);

      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, logoutReason, loading, navigate, location]);

  return null;
};

export default AuthRedirect;
