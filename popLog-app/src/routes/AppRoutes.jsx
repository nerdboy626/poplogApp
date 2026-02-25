import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  Navigate,
} from "react-router-dom";
import RootLayout from "../layouts/RootLayout.jsx";
import { trendingTitlesLoader } from "../loaders/trendingTitlesLoader.js";
import { mediaDetailsLoader } from "../loaders/mediaDetailsLoader.js";
import { searchPageLoader } from "../loaders/searchPageLoader.js";
import Home from "../pages/Home.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import SearchPage from "../pages/SearchPage.jsx";
import MediaDetails from "../components/MediaDetails.jsx";
import Login from "../pages/Login.jsx";
import NotFound from "../pages/NotFound.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import OAuthSuccess from "../pages/OAuthSuccess.jsx";
import Account from "../pages/Account.jsx";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} loader={trendingTitlesLoader} />
      <Route
        path="dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route path="searchpage">
        <Route index element={<Navigate to="movies" replace />} />
        <Route
          path=":category"
          element={<SearchPage />}
          loader={searchPageLoader}
          errorElement={<NotFound />}
        />
      </Route>

      <Route
        path="media/:mediaType/:id"
        element={<MediaDetails />}
        loader={mediaDetailsLoader}
        errorElement={<NotFound />}
      />

      <Route path="login" element={<Login />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="oauth-success" element={<OAuthSuccess />} />
      <Route
        path="account"
        element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Route>,
  ),
);
