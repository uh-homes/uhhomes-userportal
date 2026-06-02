import { useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import DashboardLayout from "./Layout/DashboardLayout";
import UDashboard from "./Pages/UDashboard";
import UConstructionTrack from "./Pages/UConstructionTrack";
import UConstructionTimeline from "./Pages/UConstructionTimeline";
import Inbox from "./UserPortal/Common/Inbox";
import ProfileSettings from "./UserPortal/Common/ProfileSettings";
import Alert from "./UserPortal/Common/Alert";
import Favorites from "./UserPortal/Common/Favorites";
import UpdatesPage from "./UserPortal/Common/UpdatesPage";
import useWishlist from "./hooks/useWishlist";
import useCurrentUser from "./hooks/useCurrentUser";
import LoginPage from "./Pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const location = useLocation();
  useWishlist();
  useCurrentUser();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
          <Route path="/userportal" element={<UDashboard />} />
          <Route path="/userconstruction" element={<UConstructionTrack />} />
          <Route path="/construction-timeline" element={<UConstructionTimeline />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/alerts" element={<Alert />} />
          <Route path="/updates" element={<UpdatesPage />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <p className="text-gray-500 text-lg">404 — Page not found</p>
            </div>
          }
        />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
