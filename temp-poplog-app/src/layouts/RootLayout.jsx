import { Outlet, useNavigation } from "react-router-dom";
import Loading from "../components/Loading.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import AuthRedirect from "../components/AuthRedirect.jsx";
import "./RootLayout.css";

const RootLayout = () => {
  const navigation = useNavigation();
  return (
    <div className="layout">
      <AuthRedirect />
      <Navbar />

      <main className="layout__content">
        {navigation.state === "loading" ? <Loading /> : <Outlet />}
      </main>

      <Footer />
    </div>
  );
};

export default RootLayout;
