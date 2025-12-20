import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";

const AuthRedirect = () => {
  const { isLoggedIn, logoutReason, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (
      !isLoggedIn &&
      logoutReason === "expired" &&
      !hasRedirectedRef.current
    ) {
      hasRedirectedRef.current = true;

      const fullPath = location.pathname + location.search + location.hash;

      sessionStorage.setItem("redirectAfterLogin", fullPath);

      navigate("/login", { replace: true });

      setTimeout(() => {
        logout(null);
      }, 500);
    }
  }, [isLoggedIn, logoutReason, loading, navigate, location, logout]);

  return null;
};

export default AuthRedirect;
