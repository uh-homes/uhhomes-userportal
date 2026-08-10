import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

/**
 * Wraps a route element and checks if the user has the required permission.
 * If not, redirects to their portal dashboard.
 * 
 * Usage: <PermissionGuard module="gallery"><SupervisorGallery /></PermissionGuard>
 */
export default function PermissionGuard({ module, action = "read", fallback, children }) {
  const user = useSelector((state) => state?.user);

  if (!user) return null;

  const hasPermission = user.permissions?.[module]?.[action] === true;

  if (!hasPermission) {
    if (fallback) return fallback;
    // Redirect to the user's portal dashboard
    const dashboardPath =
      user.category === "project_manager" ? "/pm/dashboard" :
      user.category === "site_supervisor" ? "/supervisor/dashboard" :
      user.category === "sales_agent" ? "/sales/dashboard" :
      user.role === "admin" ? "/admin/dashboard" : "/userportal";
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
}
