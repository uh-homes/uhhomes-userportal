import useProject from "../hooks/useProject";
import DocumentsSection from "../UserPortal/Construction/DocumentsSection";
import Lightbox from "../Components/Lightbox";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import api from "../Api/api";
import {
  FaCheckCircle,
  FaHardHat,
  FaClock,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaBell,
} from "react-icons/fa";

export default function UDashboard() {
  const { project, error, isLoading } = useProject();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const res = await api.get("/user-projects/report", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${(project?.name || "Project").replace(/\s+/g, "_")}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download report:", err);
      alert("Failed to download report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchExtras = async () => {
      try {
        const alertsRes = await api.get("/alerts?read=false").catch(() => null);
        if (alertsRes?.data?.data?.alerts) setAlerts(alertsRes.data.data.alerts.slice(0, 3));
        const countRes = await api.get("/alerts/unread-count").catch(() => null);
        if (countRes?.data?.data?.count !== undefined) setUnreadCount(countRes.data.data.count);
      } catch {}
    };
    fetchExtras();
    const interval = setInterval(fetchExtras, 30000);
    const handleReadUpdate = (e) => {
      setUnreadCount(e.detail?.count ?? 0);
      fetchExtras();
    };
    window.addEventListener("alerts-read-update", handleReadUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("alerts-read-update", handleReadUpdate);
    };
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

  // Collect all available project images for the right panel
  const galleryImages = [];
  if (project.gallery?.length > 0) {
    project.gallery.forEach((g) => {
      g.media?.forEach((m) => { if (m.url) galleryImages.push(m.url); });
    });
  }
  if (project.updates?.length > 0) {
    project.updates.forEach((u) => {
      u.media?.forEach((m) => { if (m.url) galleryImages.push(m.url); });
    });
  }
  if (galleryImages.length === 0) {
    galleryImages.push(
      projectImage,
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600",
      "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=600",
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600"
    );
  }

  return (
    <div className="flex-1 bg-[#FAFAFA] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Welcome + Project Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Welcome back, {displayName}</h1>
            <p className="text-sm text-gray-500 mt-1">{project.name || "Your Project"} — <span className="font-semibold text-gray-700">{project.address || ""}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/alerts")}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Alerts"
            >
              <FaBell className="text-lg text-gray-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusPill.style}`}>
              {statusPill.label}
            </span>
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="#E8D5A3" strokeWidth="4" fill="none" />
                <circle
                  cx="24" cy="24" r="20"
                  stroke="#C5A572"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 - (progressPercentage / 100) * 2 * Math.PI * 20}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-dark">
                {progressPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Project Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Project Info</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between md:flex-col md:items-start">
              <span className="text-xs text-gray-500">Start Date</span>
              <span className="text-sm font-medium text-gray-800">
                {project.startDate ? new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between md:flex-col md:items-start">
              <span className="text-xs text-gray-500">Est. Completion</span>
              <span className="text-sm font-medium text-gray-800">
                {project.estimatedEndDate ? new Date(project.estimatedEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between md:flex-col md:items-start">
              <span className="text-xs text-gray-500">Milestones</span>
              <span className="text-sm font-medium text-gray-800">
                {project.milestones?.filter((m) => m.status === "COMPLETE").length || 0}/{project.milestones?.length || 0} done
              </span>
            </div>
            <div className="flex items-center justify-between md:flex-col md:items-start">
              <span className="text-xs text-gray-500">Unread Alerts</span>
              <span className="text-sm font-medium text-gold-600">{unreadCount}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleDownloadReport}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {downloading ? (
                <span className="block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <FaDownload className="text-xs" />
              )}
              {downloading ? "Generating..." : "Download Report"}
            </button>
          </div>
        </div>

        {/* Main 2-column layout: Content Left, Images Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN — Content (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Alerts / Latest Updates */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Latest Updates</h3>
                {alerts.length > 0 && (
                  <span className="text-xs bg-gold-50 text-gold-600 px-2 py-0.5 rounded-full font-medium">
                    {alerts.length} new
                  </span>
                )}
              </div>

              {/* Alerts */}
              {alerts.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        alert.type === "SUCCESS" ? "bg-green-500" :
                        alert.type === "WARNING" ? "bg-yellow-500" :
                        alert.type === "ERROR" ? "bg-red-500" : "bg-gold-400"
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{alert.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{alert.message}</p>
                      </div>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap">
                        {new Date(alert.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mb-4">No new alerts.</p>
              )}

              {/* Latest Update */}
              {project.updates && project.updates.length > 0 && (
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-[#C5A572] bg-amber-50 px-2 py-0.5 rounded">LATEST</span>
                    <span className="text-xs text-gray-400">
                      {new Date(project.updates[0].createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800">{project.updates[0].title}</p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {project.updates[0].description || "No details available."}
                  </p>
                </div>
              )}

              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => navigate("/alerts")}
                  className="text-xs font-medium text-[#C5A572] hover:text-[#A8894D] transition-colors"
                >
                  All alerts →
                </button>
                <button
                  onClick={() => navigate("/updates")}
                  className="text-xs font-medium text-[#C5A572] hover:text-[#A8894D] transition-colors"
                >
                  All updates →
                </button>
              </div>
            </div>

            {/* 2. Construction Tracker - Bi-Weekly */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Construction Tracker</h3>
                  <p className="text-xs text-gray-500">Bi-weekly progress overview</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-[#C5A572]">{progressPercentage}%</p>
                  <p className="text-[11px] text-gray-400">
                    {project.estimatedEndDate
                      ? `Est. ${new Date(project.estimatedEndDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
                      : "Timeline TBD"}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-3 mb-5">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-[#C5A572] to-[#D4AF37] transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Current Phase Highlight */}
              {project.milestones && project.milestones.length > 0 && (() => {
                const currentPhase = project.milestones.find((m) => m.status === "IN_PROGRESS");
                const completedCount = project.milestones.filter((m) => m.status === "COMPLETE").length;
                return (
                  <div className="bg-gold-50/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Current Phase</p>
                        <p className="text-sm font-medium text-gray-800">{currentPhase?.name || "—"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Phases Completed</p>
                        <p className="text-sm font-medium text-gray-800">{completedCount} / {project.milestones.length}</p>
                      </div>
                      {currentPhase && (
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Phase Progress</p>
                          <p className="text-sm font-medium text-[#C5A572]">{currentPhase.progress || 0}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Milestone Status Pills */}
              <div className="flex flex-wrap gap-2">
                {project.milestones?.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                      m.status === "COMPLETE" ? "bg-green-50 text-green-700" :
                      m.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700" :
                      "bg-gray-50 text-gray-500"
                    }`}
                  >
                    {getMilestoneIcon(m.status)}
                    <span className="truncate max-w-[100px]">{m.name}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate("/userconstruction")}
                className="mt-5 bg-gradient text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                View Full Tracker →
              </button>
            </div>

            {/* 3. Construction Timeline */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Construction Timeline</h3>
              {project.milestones && project.milestones.length > 0 ? (
                <div className="relative ml-3">
                  {project.milestones.map((milestone, idx) => (
                    <div key={milestone.id || idx} className="relative pl-8 pb-5 last:pb-0">
                      {idx < project.milestones.length - 1 && (
                        <div className={`absolute left-[7px] top-4 w-0.5 h-full ${
                          milestone.status === "COMPLETE" ? "bg-gold-400" : "bg-gray-200"
                        }`}></div>
                      )}
                      <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        milestone.status === "COMPLETE" ? "bg-gold-400 border-gold-400" :
                        milestone.status === "IN_PROGRESS" ? "bg-white border-gold-400" :
                        "bg-white border-gray-300"
                      }`}>
                        {milestone.status === "COMPLETE" && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${milestone.status === "COMPLETE" ? "text-gray-800" : milestone.status === "IN_PROGRESS" ? "text-gray-800" : "text-gray-400"}`}>
                            {milestone.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {milestone.date ? new Date(milestone.date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                            {milestone.status === "IN_PROGRESS" && ` • ${milestone.progress || 0}% complete`}
                          </p>
                        </div>
                        {milestone.status === "IN_PROGRESS" && (
                          <div className="w-20 h-1.5 bg-gold-50 rounded-full overflow-hidden">
                            <div className="h-full bg-gold-400 rounded-full" style={{ width: `${milestone.progress || 0}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No milestones scheduled.</p>
              )}
              <button
                onClick={() => navigate("/construction-timeline")}
                className="mt-5 text-xs font-medium text-[#C5A572] hover:text-[#A8894D] transition-colors"
              >
                View detailed timeline →
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN — Images & Quick Info (1/3 width) */}
          <div className="space-y-6">

            {/* Project Hero Image */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <img
                src={projectImage}
                alt="Project"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800";
                }}
              />
              <div className="p-4">
                <p className="text-sm font-medium text-gray-800">{project.name}</p>
                <p className="text-xs text-gray-500">{project.address}</p>
              </div>
            </div>

            {/* Photo Gallery Slider */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Construction Photos</h4>
              <div className="relative group cursor-pointer" onClick={() => setLightboxOpen(true)}>
                <img
                  src={galleryImages[photoIndex]}
                  alt={`Site photo ${photoIndex + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800";
                  }}
                />
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setPhotoIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setPhotoIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaChevronRight className="w-3 h-3" />
                    </button>
                  </>
                )}
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {photoIndex + 1} / {galleryImages.length}
                </div>
              </div>
              {galleryImages.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {galleryImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPhotoIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === photoIndex ? "bg-gold-400" : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>



          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-hidden">
          <DocumentsSection documents={project.documents || []} />
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 pt-6 pb-4 mt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <button onClick={() => {}} className="text-xs text-gray-400 hover:text-[#C5A572] transition-colors">Help</button>
              <button onClick={() => {}} className="text-xs text-gray-400 hover:text-[#C5A572] transition-colors">Support</button>
              <button onClick={() => {}} className="text-xs text-gray-400 hover:text-[#C5A572] transition-colors">FAQ</button>
            </div>
            <p className="text-xs text-gray-400">© {new Date().getFullYear()} UHHomes. All rights reserved.</p>
          </div>
        </footer>

      </div>

      {lightboxOpen && (
        <Lightbox
          images={galleryImages}
          currentIndex={photoIndex}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={(idx) => setPhotoIndex(idx)}
        />
      )}
    </div>
  );
}
