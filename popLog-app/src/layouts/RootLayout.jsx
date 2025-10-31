import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

const RootLayout = () => {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default RootLayout;
