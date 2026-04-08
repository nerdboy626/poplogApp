import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, logoutReason } = useAuth();

  if (!isLoggedIn) {
    const isManualLogout = logoutReason === "manual";

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname + location.search + location.hash,
          message: isManualLogout
            ? undefined
            : `You must be logged in to access the ${location.pathname.slice(1)} page`,
        }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
