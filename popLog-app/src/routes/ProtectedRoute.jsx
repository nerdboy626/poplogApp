import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "You must be logged in to access this page",
        }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
