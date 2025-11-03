import { NavLink } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
const Navbar = () => {
  const auth = useAuth();
  const handleLogout = () => {
    auth.logout();
  };
  return (
    <div>
      <ul className="navbar">
        <NavLink to="/">
          <li>Home</li>
        </NavLink>
        <NavLink to="/dashboard">
          <li>Dashboard</li>
        </NavLink>
        <NavLink to="/search">
          <li>Search</li>
        </NavLink>
        {auth.user ? (
          <NavLink to="/" onClick={handleLogout}>
            <li>Logout</li>
          </NavLink>
        ) : (
          <NavLink to="/login">
            <li>Login</li>
          </NavLink>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
