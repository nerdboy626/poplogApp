import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
import "./Navbar.css";

const Navbar = () => {
  const auth = useAuth();
  const handleLogout = () => {
    auth.logout();
  };
  return (
    <div className="navbar">
      <ul>
        <li>
          <NavLink to="/" end>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/searchpage">Search</NavLink>
        </li>
        {auth.user ? (
          <li>
            <Link to="/" onClick={handleLogout}>
              Logout
            </Link>
          </li>
        ) : (
          <li>
            <NavLink to="/login">Login</NavLink>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Navbar;
