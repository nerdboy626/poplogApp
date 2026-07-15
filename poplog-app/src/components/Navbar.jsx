import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../utils/AuthContext.jsx";
import { IoHomeOutline } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import { LuNotebookPen } from "react-icons/lu";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useLocation } from "react-router-dom";

import logo from "../assets/logo.svg";
import logoSmall from "../assets/logoSmall.svg";
import "./Navbar.css";

const Navbar = () => {
  const auth = useAuth();
  const location = useLocation();

  return (
    <header className="nav">
      <nav className="nav__inner">
        <Link to="/" className="nav__brand">
          <img src={logo} alt="PopLog logo" className="nav__logo-desktop" />
          <img src={logoSmall} alt="PopLog logo" className="nav__logo-mobile" />
        </Link>

        <ul className="nav__links">
          <li>
            <NavLink to="/" end className="nav__link">
              <IoHomeOutline />
              <span>Home</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/search-page" className="nav__link">
              <IoSearch />
              <span>Search</span>
            </NavLink>
          </li>

          <li>
            <NavLink to="/journal" className="nav__link">
              <LuNotebookPen />
              <span>Journal</span>
            </NavLink>
          </li>
        </ul>

        <div className="nav__user">
          {auth.user ? (
            <NavLink to="/account" className="nav__link">
              <IoPersonCircleOutline className="nav__profile-icon" />
              <span>{auth.user.username}</span>
            </NavLink>
          ) : (
            <NavLink
              to="/login"
              className="nav__link"
              state={{
                from: location.pathname + location.search + location.hash,
              }}
            >
              <IoPersonCircleOutline className="nav__profile-icon" />
              <span>Login</span>
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
