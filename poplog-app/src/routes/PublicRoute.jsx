import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";

const PublicRoute = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null;

  if (isLoggedIn) {
    const redirectPath = location.state?.from || "/account";

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PublicRoute;
