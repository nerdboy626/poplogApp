import { Outlet, useNavigation } from "react-router-dom";
import Loading from "../components/Loading.jsx";
import Navbar from "../components/Navbar.jsx";
import AuthRedirect from "../components/AuthRedirect.jsx";

const RootLayout = () => {
  const navigation = useNavigation();
  return (
    <>
      <AuthRedirect />
      <Navbar />
      {navigation.state === "loading" ? <Loading /> : <Outlet />}
    </>
  );
};

export default RootLayout;
