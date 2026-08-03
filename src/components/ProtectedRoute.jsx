import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const user = useSelector((state) => state?.user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const user = useSelector((state) => state?.user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/userportal" replace />;
  }

  return <Outlet />;
}

export function UserRoute() {
  const user = useSelector((state) => state?.user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.category === "site_supervisor") {
    return <Navigate to="/supervisor/dashboard" replace />;
  }

  if (user.category === "sales_agent") {
    return <Navigate to="/sales/dashboard" replace />;
  }

  return <Outlet />;
}

export function SalesAgentRoute() {
  const user = useSelector((state) => state?.user);

  if (!user) {
    return <Navigate to="/sales-login" replace />;
  }

  if (user.category !== "sales_agent") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function SupervisorRoute() {
  const user = useSelector((state) => state?.user);

  if (!user) {
    return <Navigate to="/supervisor" replace />;
  }

  if (user.category !== "site_supervisor") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
