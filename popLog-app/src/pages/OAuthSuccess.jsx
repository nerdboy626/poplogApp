import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
import { jwtDecode } from "jwt-decode";

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

      navigate("/");
    } else {
      navigate("/login");
    }
  }, []);

  return <p>Signing you in…</p>;
};

export default OAuthSuccess;
