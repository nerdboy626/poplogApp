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
import Journal from "../pages/Journal.jsx";
import SearchPage from "../pages/SearchPage.jsx";
import MediaDetails from "../components/MediaDetails.jsx";
import Login from "../pages/Login.jsx";
import NotFound from "../pages/NotFound.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicRoute from "./PublicRoute.jsx";
import ForgotPassword from "../pages/ForgotPassword.jsx";
import ResetPassword from "../pages/ResetPassword.jsx";
import OAuthSuccess from "../pages/OAuthSuccess.jsx";
import Account from "../pages/Account.jsx";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route index element={<Home />} loader={trendingTitlesLoader} />
      <Route
        path="journal"
        element={
          <ProtectedRoute>
            <Journal />
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

      <Route
        path="login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      <Route
        path="oauth-success"
        element={
          <PublicRoute>
            <OAuthSuccess />
          </PublicRoute>
        }
      />

      <Route path="reset-password" element={<ResetPassword />} />

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
