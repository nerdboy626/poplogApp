import { NavLink } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
import { IoHomeOutline } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { LuNotebookPen } from "react-icons/lu";
import { IoPersonCircleOutline } from "react-icons/io5";

import logo from "../assets/logo.svg";
import "./Navbar.css";

const Navbar = () => {
  const auth = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-logo">
            <img src={logo} alt="Poplog logo" />
          </div>

          <ul className="navbar-primary-links">
            <li>
              <NavLink to="/" end>
                <IoHomeOutline />
                Home
              </NavLink>
            </li>

            <li>
              <NavLink to="/searchpage">
                <IoSearch />
                Search
              </NavLink>
            </li>

            <li>
              <NavLink to="/dashboard">
                <LuNotebookPen />
                Journal
              </NavLink>
            </li>
          </ul>
        </div>

        <div className="navbar-right">
          {auth.user ? (
            <NavLink to="/account">
              <IoPersonCircleOutline className="profile-icon" />
              <span>{auth.user.username} </span>
            </NavLink>
          ) : (
            <NavLink to="/login">
              <IoPersonCircleOutline className="profile-icon" />
              <span>Login</span>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
