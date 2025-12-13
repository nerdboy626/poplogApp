import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

const AuthRedirect = () => {
  const { isLoggedIn, logoutReason, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isLoggedIn && logoutReason === "expired") {
      navigate("/login", {
        replace: true,
        state: { path: location.pathname },
      });
    }
  }, [isLoggedIn, logoutReason, loading]);

  return null;
};

export default AuthRedirect;
