import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import DashboardLayout from "./Layout/DashboardLayout";
import AdminLayout from "./Layout/AdminLayout";
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
import ProtectedRoute, { AdminRoute, UserRoute } from "./components/ProtectedRoute";

import AdminDashboard from "./AdminPortal/AdminDashboard";
import AdminUsers from "./AdminPortal/AdminUsers";
import AdminAlerts from "./AdminPortal/AdminAlerts";
import AdminProjects from "./AdminPortal/AdminProjects";
import AdminTimeline from "./AdminPortal/AdminTimeline";
import AdminProperties from "./AdminPortal/AdminProperties";
import AdminSettings from "./AdminPortal/AdminSettings";
import AdminGallery from "./AdminPortal/AdminGallery";
import AdminReports from "./AdminPortal/AdminReports";
import AdminNotifications from "./AdminPortal/AdminNotifications";
import AdminAISummary from "./AdminPortal/AdminAISummary";
import AdminInquiries from "./AdminPortal/AdminInquiries";

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

        {/* User Portal Routes */}
        <Route element={<UserRoute />}>
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

        {/* Admin Portal Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/alerts" element={<AdminAlerts />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/timeline" element={<AdminTimeline />} />
            <Route path="/admin/gallery" element={<AdminGallery />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/inquiries" element={<AdminInquiries />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/ai-summary" element={<AdminAISummary />} />
            <Route path="/admin/properties" element={<AdminProperties />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
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
