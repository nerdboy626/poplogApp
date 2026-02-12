import { NavLink } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
import "./Navbar.css";

const Navbar = () => {
  const auth = useAuth();

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
            {/* username instead of logout */}
            <NavLink to="/account">{auth.user.username}</NavLink>
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
