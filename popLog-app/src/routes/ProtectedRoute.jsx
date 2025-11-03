import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { isLoggedIn, loading } = useAuth();

  if (!isLoggedIn) {
    if (loading) {
      return <div>Loading...</div>;
    }
    return <Navigate to="/login" state={{ path: location.pathname }} />;
  }
  return children;
};

export default ProtectedRoute;
