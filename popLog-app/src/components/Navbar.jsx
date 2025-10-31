import { NavLink } from "react-router-dom";
const Navbar = () => {
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
        <NavLink to="/login">
          <li>Login</li>
        </NavLink>
      </ul>
    </div>
  );
};

export default Navbar;
