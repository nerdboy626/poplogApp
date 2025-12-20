import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import AuthRedirect from "../components/AuthRedirect.jsx";

const RootLayout = () => {
  return (
    <>
      <AuthRedirect />
      <Navbar />
      <Outlet />
    </>
  );
};

export default RootLayout;
