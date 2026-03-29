import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutReason, setLogoutReason] = useState(null);

  const logoutTimer = useRef(null);

  const scheduleAutoLogout = (expiration) => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);

    const msUntilExp = expiration * 1000 - Date.now();

    if (msUntilExp > 0) {
      logoutTimer.current = setTimeout(() => {
        logout("expired");
      }, msUntilExp);
    } else {
      logout("expired");
    }
  };

  const login = (userData) => {
    try {
      const decoded = jwtDecode(userData.token);

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setLogoutReason(null);

      scheduleAutoLogout(decoded.exp);
    } catch (err) {
      console.error("Login decode error:", err);
      logout();
    }
  };

  const logout = (reason = null) => {
    setUser(null);
    setLogoutReason(reason);
    localStorage.removeItem("user");

    if (logoutTimer.current) clearTimeout(logoutTimer.current);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(storedUser);

      if (!parsed?.token) {
        logout();
        setLoading(false);
        return;
      }

      const decoded = jwtDecode(parsed.token);

      if (decoded.exp * 1000 < Date.now()) {
        logout();
      } else {
        setUser(parsed);
        scheduleAutoLogout(decoded.exp);
      }
    } catch (err) {
      console.error("Auth init error:", err);
      logout();
    }

    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoggedIn: !!user,
      login,
      logout,
      logoutReason,
      loading,
    }),
    [user, logoutReason, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
