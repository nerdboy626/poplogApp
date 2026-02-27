import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
import toast from "react-hot-toast";

const PublicRoute = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    toast.error("You're already logged in.");
    return (
      <Navigate to="/account" replace state={{ from: location.pathname }} />
    );
  }

  return children;
};

export default PublicRoute;
