import useProject from "../hooks/useProject";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import api from "../Api/api";
import {
  FaCheckCircle,
  FaHardHat,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function UDashboard() {
  const { project, error, isLoading } = useProject();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [alerts, setAlerts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const [alertsRes, favsRes] = await Promise.all([
          api.get("/alerts?read=false").catch(() => null),
          api.get("/favorites").catch(() => null),
        ]);
        if (alertsRes?.data?.data?.alerts) setAlerts(alertsRes.data.data.alerts.slice(0, 3));
        if (favsRes?.data?.data) setFavorites(favsRes.data.data.slice(0, 3));
      } catch {}
    };
    fetchExtras();
  }, []);

  const getStatusPill = (status) => {
    switch (status) {
      case "IN_PROGRESS":
        return { label: "On Track", style: "bg-gold-50 text-gold-600 border border-gold-200" };
      case "DELAYED":
        return { label: "Delayed", style: "bg-red-50 text-red-700 border border-red-200" };
      case "COMPLETED":
        return { label: "Complete", style: "bg-gold-100 text-gold-600 border border-gold-300" };
      case "ON_HOLD":
        return { label: "On Hold", style: "bg-gray-100 text-dark-muted border border-gray-300" };
      default:
        return { label: "In Progress", style: "bg-gold-50 text-gold-600 border border-gold-200" };
    }
  };

  const getMilestoneIcon = (status) => {
    switch (status) {
      case "COMPLETE":
        return <FaCheckCircle className="text-gold-400" />;
      case "IN_PROGRESS":
        return <FaHardHat className="text-gold-light" />;
      case "DELAYED":
        return <FaExclamationTriangle className="text-dark-muted" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gold-400 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-dark-muted text-sm">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-dark-muted mb-4">Unable to load project data</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-gradient text-white rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!project) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white p-10 rounded-2xl shadow-sm max-w-sm">
            <h2 className="text-xl text-dark">No Active Project</h2>
            <p className="text-sm text-dark-muted mt-3">
              You don't have any project assigned yet. Contact support if you believe this is an error.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-gradient text-white rounded-lg text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusPill = getStatusPill(project.status);
  const progressPercentage = project.completionPercentage || 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const projectImage =
    project.property?.thumbnail ||
    (project.gallery?.length > 0 && project.gallery[0].media?.[0]?.url) ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800";

  const displayName = user?.fullName?.split(" ")[0] || "there";

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-2xl text-dark">Welcome back, {displayName}</h1>
          <p className="text-dark-muted text-sm mt-1">Here's your project overview</p>
        </div>

        {/* Project Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-[55%] p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-lg text-dark">{project.name || "Your Project"}</h2>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusPill.style}`}>
                    {statusPill.label}
                  </span>
                </div>
                <p className="text-sm text-dark-muted">
                  {project.address || "Address not specified"}
                </p>

                {/* Completion Ring */}
                <div className="flex items-center gap-4 mt-5">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 -rotate-90">
                      <circle cx="32" cy="32" r="26" stroke="#E8D5A3" strokeWidth="5" fill="none" />
                      <circle
                        cx="32" cy="32" r="26"
                        stroke="#C5A572"
                        strokeWidth="5"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 26}
                        strokeDashoffset={2 * Math.PI * 26 - (progressPercentage / 100) * 2 * Math.PI * 26}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-dark">
                      {progressPercentage}%
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-dark">Completion</p>
                    <p className="text-xs text-dark-muted">
                      {project.estimatedEndDate
                        ? `Est. ${new Date(project.estimatedEndDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                        : "Timeline TBD"}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/userconstruction")}
                className="bg-gradient text-white px-5 py-2.5 rounded-lg mt-6 text-sm font-medium hover:opacity-90 transition-opacity self-start"
              >
                View Construction
              </button>
            </div>
            <div className="md:w-[45%]">
              <img
                src={projectImage}
                alt="Project"
                className="w-full h-full min-h-[200px] object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800";
                }}
              />
            </div>
          </div>
        </div>

        {/* Latest Update + Mini Timeline */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Latest Update */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-dark mb-4">Latest Update</h3>
            {project.updates && project.updates.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-dark">{project.updates[0].title}</p>
                <p className="text-xs text-dark-muted mt-1">
                  Posted {new Date(project.updates[0].createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p className="text-sm text-dark-light mt-3 line-clamp-3">
                  {project.updates[0].description || "No details available."}
                </p>
                {project.updates[0].media?.[0]?.url && (
                  <img
                    src={project.updates[0].media[0].url}
                    alt="Update"
                    className="mt-4 rounded-lg w-full h-32 object-cover"
                  />
                )}
              </div>
            ) : (
              <p className="text-sm text-dark-muted">No updates yet.</p>
            )}
            <button
              onClick={() => navigate("/updates")}
              className="mt-4 text-sm text-gold-400 font-medium hover:text-gold-dark transition-colors"
            >
              View all updates →
            </button>
          </div>

          {/* Mini Construction Timeline */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-dark mb-4">Construction Timeline</h3>
            {project.milestones && project.milestones.length > 0 ? (
              <div className="space-y-3">
                {project.milestones.slice(0, 6).map((milestone, idx) => (
                  <div key={milestone.id || idx} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold-50 flex items-center justify-center">
                      {getMilestoneIcon(milestone.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark truncate">{milestone.name}</p>
                      <p className="text-xs text-dark-muted">
                        {milestone.status === "COMPLETE"
                          ? "Completed"
                          : milestone.status === "IN_PROGRESS"
                          ? `${milestone.progress || 0}% done`
                          : milestone.status === "DELAYED"
                          ? "Delayed"
                          : "Planned"}
                      </p>
                    </div>
                    {milestone.status === "IN_PROGRESS" && (
                      <div className="w-16 h-1.5 bg-gold-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold-400 rounded-full"
                          style={{ width: `${milestone.progress || 0}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-dark-muted">No milestones scheduled.</p>
            )}
            <button
              onClick={() => navigate("/userconstruction")}
              className="mt-4 text-sm text-gold-400 font-medium hover:text-gold-dark transition-colors"
            >
              Full timeline →
            </button>
          </div>
        </div>

        {/* Alerts Digest + Favorites Snapshot */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Alerts Digest */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-dark">Alerts</h3>
              {alerts.length > 0 && (
                <span className="text-xs bg-gold-50 text-gold-600 px-2 py-0.5 rounded-full font-medium">
                  {alerts.length} new
                </span>
              )}
            </div>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-gold-400 mt-1.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-sm font-medium text-dark">{alert.title}</p>
                      <p className="text-xs text-dark-muted mt-0.5 line-clamp-1">{alert.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-dark-muted">No new alerts.</p>
            )}
            <button
              onClick={() => navigate("/useralerts")}
              className="mt-4 text-sm text-gold-400 font-medium hover:text-gold-dark transition-colors"
            >
              View all alerts →
            </button>
          </div>

          {/* Favorites Snapshot */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-dark mb-4">Saved Properties</h3>
            {favorites.length > 0 ? (
              <div className="space-y-3">
                {favorites.map((fav) => (
                  <div key={fav.id} className="flex items-center gap-3">
                    <img
                      src={fav.property?.thumbnail || "https://via.placeholder.com/60x60"}
                      alt={fav.property?.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-dark truncate">{fav.property?.name || "Property"}</p>
                      <p className="text-xs text-dark-muted">{fav.property?.location || ""}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs font-medium text-dark">
                        {fav.property?.bedrooms || 0} bed / {fav.property?.bathrooms || 0} bath
                      </p>
                      <p className="text-xs text-dark-muted">{fav.property?.squareFeet?.toLocaleString() || "—"} sqft</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-dark-muted">No saved properties yet.</p>
            )}
            <button
              onClick={() => navigate("/userfavourites")}
              className="mt-4 text-sm text-gold-400 font-medium hover:text-gold-dark transition-colors"
            >
              View favorites →
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-6 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <button onClick={() => {}} className="text-sm text-dark-muted hover:text-gold-400 transition-colors">Help</button>
              <button onClick={() => {}} className="text-sm text-dark-muted hover:text-gold-400 transition-colors">Support</button>
              <button onClick={() => {}} className="text-sm text-dark-muted hover:text-gold-400 transition-colors">FAQ</button>
            </div>
            <p className="text-xs text-dark-muted">© {new Date().getFullYear()} UHHomes. All rights reserved.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
