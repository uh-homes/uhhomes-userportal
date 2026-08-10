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
import ProtectedRoute, { AdminRoute, UserRoute, SupervisorRoute, SalesAgentRoute, ProjectManagerRoute } from "./components/ProtectedRoute";

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
import AdminProjectManagers from "./AdminPortal/AdminProjectManagers";
import AdminWarrantyConfig from "./AdminPortal/AdminWarrantyConfig";

import SupervisorLayout from "./Layout/SupervisorLayout";
import SupervisorDashboard from "./SupervisorPortal/SupervisorDashboard";
import SupervisorProjects from "./SupervisorPortal/SupervisorProjects";
import SupervisorProjectDetail from "./SupervisorPortal/SupervisorProjectDetail";
import SupervisorUpdates from "./SupervisorPortal/SupervisorUpdates";
import SupervisorInquiries from "./SupervisorPortal/SupervisorInquiries";
import SupervisorDocuments from "./SupervisorPortal/SupervisorDocuments";
import SupervisorIssues from "./SupervisorPortal/SupervisorIssues";

import PMLayout from "./Layout/PMLayout";
import PMDashboard from "./PMPortal/PMDashboard";
import PMProjects from "./PMPortal/PMProjects";
import PMProjectDetail from "./PMPortal/PMProjectDetail";
import PMTimeline from "./PMPortal/PMTimeline";
import PMGallery from "./PMPortal/PMGallery";
import PMDocuments from "./PMPortal/PMDocuments";
import PMInquiries from "./PMPortal/PMInquiries";
import PMAlerts from "./PMPortal/PMAlerts";
import PMReports from "./PMPortal/PMReports";
import PMProfile from "./PMPortal/PMProfile";
import PMWarranties from "./PMPortal/PMWarranties";

import SalesAgentLayout from "./Layout/SalesAgentLayout";
import SalesAgentDashboard from "./SalesAgentPortal/SalesAgentDashboard";
import SalesAgentProperties from "./SalesAgentPortal/SalesAgentProperties";
import SalesAgentLeads from "./SalesAgentPortal/SalesAgentLeads";
import SalesAgentTours from "./SalesAgentPortal/SalesAgentTours";
import SalesAgentBuyers from "./SalesAgentPortal/SalesAgentBuyers";
import SalesAgentPipeline from "./SalesAgentPortal/SalesAgentPipeline";
import SalesAgentProfile from "./SalesAgentPortal/SalesAgentProfile";
import PermissionGuard from "./components/PermissionGuard";
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
            <Route path="/admin/project-managers" element={<AdminProjectManagers />} />
            <Route path="/admin/warranty-config" element={<AdminWarrantyConfig />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Supervisor Portal Routes */}
        <Route element={<SupervisorRoute />}>
          <Route element={<SupervisorLayout />}>
            <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
            <Route path="/supervisor/projects" element={<PermissionGuard module="constructionTracker"><SupervisorProjects /></PermissionGuard>} />
            <Route path="/supervisor/projects/:id" element={<PermissionGuard module="constructionTracker"><SupervisorProjectDetail /></PermissionGuard>} />
            <Route path="/supervisor/updates" element={<SupervisorUpdates />} />
            <Route path="/supervisor/inquiries" element={<PermissionGuard module="inquiries"><SupervisorInquiries /></PermissionGuard>} />
            <Route path="/supervisor/documents" element={<PermissionGuard module="documents"><SupervisorDocuments /></PermissionGuard>} />
            <Route path="/supervisor/issues" element={<SupervisorIssues />} />
            <Route path="/supervisor/timeline" element={<PermissionGuard module="timeline"><SupervisorTimeline /></PermissionGuard>} />
            <Route path="/supervisor/gallery" element={<PermissionGuard module="gallery"><SupervisorGallery /></PermissionGuard>} />
            <Route path="/supervisor/alerts" element={<PermissionGuard module="alerts"><SupervisorAlerts /></PermissionGuard>} />
            <Route path="/supervisor/profile" element={<PermissionGuard module="profile"><SupervisorProfile /></PermissionGuard>} />
            <Route path="/supervisor/reports" element={<PermissionGuard module="reports"><SupervisorReports /></PermissionGuard>} />
          </Route>
        </Route>

        {/* Project Manager Portal Routes */}
        <Route element={<ProjectManagerRoute />}>
          <Route element={<PMLayout />}>
            <Route path="/pm/dashboard" element={<PMDashboard />} />
            <Route path="/pm/projects" element={<PermissionGuard module="constructionTracker"><PMProjects /></PermissionGuard>} />
            <Route path="/pm/projects/:id" element={<PermissionGuard module="constructionTracker"><PMProjectDetail /></PermissionGuard>} />
            <Route path="/pm/timeline" element={<PermissionGuard module="timeline"><PMTimeline /></PermissionGuard>} />
            <Route path="/pm/gallery" element={<PermissionGuard module="gallery"><PMGallery /></PermissionGuard>} />
            <Route path="/pm/documents" element={<PermissionGuard module="documents"><PMDocuments /></PermissionGuard>} />
            <Route path="/pm/warranties" element={<PermissionGuard module="documents"><PMWarranties /></PermissionGuard>} />
            <Route path="/pm/inquiries" element={<PermissionGuard module="inquiries"><PMInquiries /></PermissionGuard>} />
            <Route path="/pm/alerts" element={<PermissionGuard module="alerts"><PMAlerts /></PermissionGuard>} />
            <Route path="/pm/reports" element={<PermissionGuard module="reports"><PMReports /></PermissionGuard>} />
            <Route path="/pm/profile" element={<PermissionGuard module="profile"><PMProfile /></PermissionGuard>} />
          </Route>
        </Route>

        {/* Sales Agent Portal Routes */}
        <Route element={<SalesAgentRoute />}>
          <Route element={<SalesAgentLayout />}>
            <Route path="/sales/dashboard" element={<SalesAgentDashboard />} />
            <Route path="/sales/properties" element={<PermissionGuard module="constructionTracker"><SalesAgentProperties /></PermissionGuard>} />
            <Route path="/sales/leads" element={<PermissionGuard module="inquiries"><SalesAgentLeads /></PermissionGuard>} />
            <Route path="/sales/tours" element={<PermissionGuard module="timeline"><SalesAgentTours /></PermissionGuard>} />
            <Route path="/sales/buyers" element={<PermissionGuard module="favorites"><SalesAgentBuyers /></PermissionGuard>} />
            <Route path="/sales/pipeline" element={<PermissionGuard module="reports"><SalesAgentPipeline /></PermissionGuard>} />
            <Route path="/sales/profile" element={<PermissionGuard module="profile"><SalesAgentProfile /></PermissionGuard>} />
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
