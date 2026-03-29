import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import Loading from "../components/Loading.jsx";

const OAuthSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const token = params.get("token");

    if (!token) {
      toast.error("Login with Google failed.", { id: "main" });
      navigate("/login", { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token);

      auth.login({
        id: decoded.id,
        username: decoded.username,
        token,
      });

      navigate("/", { replace: true });
    } catch (err) {
      console.error("OAuth decode error:", err);
      toast.error("Login failed.", { id: "main" });
      navigate("/login", { replace: true });
    }
  }, [params, navigate, auth]);

  return <Loading text="Signing you in..." />;
};

export default OAuthSuccess;
