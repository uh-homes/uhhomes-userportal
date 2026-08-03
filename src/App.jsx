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
import UGallery from "./Pages/UGallery";
import Inbox from "./UserPortal/Common/Inbox";
import ProfileSettings from "./UserPortal/Common/ProfileSettings";
import Alert from "./UserPortal/Common/Alert";
import Favorites from "./UserPortal/Common/Favorites";
import UpdatesPage from "./UserPortal/Common/UpdatesPage";
import useWishlist from "./hooks/useWishlist";
import useCurrentUser from "./hooks/useCurrentUser";
import LoginPage from "./Pages/LoginPage";
import ProtectedRoute, { AdminRoute, UserRoute, SupervisorRoute, SalesAgentRoute } from "./components/ProtectedRoute";

import AdminDashboard from "./AdminPortal/AdminDashboard";
import AdminUsers from "./AdminPortal/AdminUsers";
import AdminAlerts from "./AdminPortal/AdminAlerts";
import AdminProjects from "./AdminPortal/AdminProjects";
import AdminTimeline from "./AdminPortal/AdminTimeline";
import AdminSettings from "./AdminPortal/AdminSettings";
import AdminGallery from "./AdminPortal/AdminGallery";
import AdminReports from "./AdminPortal/AdminReports";
import AdminAISummary from "./AdminPortal/AdminAISummary";
import AdminInquiries from "./AdminPortal/AdminInquiries";
import AdminUserManagement from "./AdminPortal/AdminUserManagement";

import SupervisorLayout from "./Layout/SupervisorLayout";
import SupervisorDashboard from "./SupervisorPortal/SupervisorDashboard";
import SupervisorProjects from "./SupervisorPortal/SupervisorProjects";
import SupervisorProjectDetail from "./SupervisorPortal/SupervisorProjectDetail";
import SupervisorUpdates from "./SupervisorPortal/SupervisorUpdates";
import SupervisorInquiries from "./SupervisorPortal/SupervisorInquiries";
import SupervisorDocuments from "./SupervisorPortal/SupervisorDocuments";
import SupervisorIssues from "./SupervisorPortal/SupervisorIssues";

import SalesAgentLayout from "./Layout/SalesAgentLayout";
import SalesAgentDashboard from "./SalesAgentPortal/SalesAgentDashboard";
import SalesAgentProperties from "./SalesAgentPortal/SalesAgentProperties";
import SalesAgentLeads from "./SalesAgentPortal/SalesAgentLeads";
import SalesAgentTours from "./SalesAgentPortal/SalesAgentTours";
import SalesAgentBuyers from "./SalesAgentPortal/SalesAgentBuyers";
import SalesAgentPipeline from "./SalesAgentPortal/SalesAgentPipeline";
import SalesAgentProfile from "./SalesAgentPortal/SalesAgentProfile";
import SupervisorTimeline from "./SupervisorPortal/SupervisorTimeline";
import SupervisorGallery from "./SupervisorPortal/SupervisorGallery";
import SupervisorAlerts from "./SupervisorPortal/SupervisorAlerts";
import SupervisorProfile from "./SupervisorPortal/SupervisorProfile";
import SupervisorReports from "./SupervisorPortal/SupervisorReports";

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
            <Route path="/gallery" element={<UGallery />} />
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
            <Route path="/admin/ai-summary" element={<AdminAISummary />} />
            <Route path="/admin/user-management" element={<AdminUserManagement />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Supervisor Portal Routes */}
        <Route element={<SupervisorRoute />}>
          <Route element={<SupervisorLayout />}>
            <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
            <Route path="/supervisor/projects" element={<SupervisorProjects />} />
            <Route path="/supervisor/projects/:id" element={<SupervisorProjectDetail />} />
            <Route path="/supervisor/updates" element={<SupervisorUpdates />} />
            <Route path="/supervisor/inquiries" element={<SupervisorInquiries />} />
            <Route path="/supervisor/documents" element={<SupervisorDocuments />} />
            <Route path="/supervisor/issues" element={<SupervisorIssues />} />
            <Route path="/supervisor/timeline" element={<SupervisorTimeline />} />
            <Route path="/supervisor/gallery" element={<SupervisorGallery />} />
            <Route path="/supervisor/alerts" element={<SupervisorAlerts />} />
            <Route path="/supervisor/profile" element={<SupervisorProfile />} />
            <Route path="/supervisor/reports" element={<SupervisorReports />} />
          </Route>
        </Route>

        {/* Sales Agent Portal Routes */}
        <Route element={<SalesAgentRoute />}>
          <Route element={<SalesAgentLayout />}>
            <Route path="/sales/dashboard" element={<SalesAgentDashboard />} />
            <Route path="/sales/properties" element={<SalesAgentProperties />} />
            <Route path="/sales/leads" element={<SalesAgentLeads />} />
            <Route path="/sales/tours" element={<SalesAgentTours />} />
            <Route path="/sales/buyers" element={<SalesAgentBuyers />} />
            <Route path="/sales/pipeline" element={<SalesAgentPipeline />} />
            <Route path="/sales/profile" element={<SalesAgentProfile />} />
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
