import { useEffect, useState } from "react";
import api from "../Api/api";
import { HiOutlineClock, HiOutlineCalendar, HiOutlineCheckCircle } from "react-icons/hi";

export default function PMTimeline() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/pm/projects");
        setProjects(res.data.data);
        if (res.data.data.length > 0) setSelectedProject(res.data.data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject?.id) {
      fetchTimeline(selectedProject.id);
      fetchProjectUpdates(selectedProject.id);
    }
  }, [selectedProject?.id]);

  const fetchTimeline = async (projectId) => {
    try {
      const res = await api.get(`/pm/timeline/${projectId}`);
      setMilestones(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProjectUpdates = async (projectId) => {
    try {
      const res = await api.get(`/pm/projects/${projectId}`);
      setUpdates(res.data.data?.updates || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  const sorted = [...milestones].sort((a, b) => (a.order || 0) - (b.order || 0));
  const completedCount = sorted.filter((m) => m.status === "COMPLETE" || m.status === "COMPLETED").length;
  const overallProgress = sorted.length > 0 ? Math.round((completedCount / sorted.length) * 100) : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Construction Timeline</h1>

      {/* Project Selector */}
      {projects.length > 0 && (
        <div className="mb-6">
          <select
            value={selectedProject?.id || ""}
            onChange={(e) => setSelectedProject(projects.find((p) => p.id === parseInt(e.target.value)))}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name} — {p.user?.fullName || "No Client"}</option>
            ))}
          </select>
        </div>
      )}

      {selectedProject && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Construction Tracker */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[#1A1A1A]">{selectedProject.name}</h2>
              <p className="text-sm text-gray-500">{selectedProject.user?.fullName} • {selectedProject.address}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{completedCount} of {sorted.length} complete</span>
              <span className="text-xs font-medium text-[#C5A572]">{overallProgress}%</span>
            </div>
          </div>

          {/* Overall Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#C5A572] to-[#D4AF37] transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {/* Timeline */}
          <div className="relative ml-4">
            {sorted.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <HiOutlineClock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No timeline data for this project.</p>
              </div>
            ) : (
              sorted.map((milestone, idx) => {
                const isComplete = milestone.status === "COMPLETE" || milestone.status === "COMPLETED";
                const isInProgress = milestone.status === "IN_PROGRESS";
                const isLast = idx === sorted.length - 1;

                return (
                  <div key={milestone.id} className="relative pl-8 pb-6 last:pb-0">
                    {/* Connector line */}
                    {!isLast && (
                      <div className={`absolute left-[7px] top-4 w-0.5 h-full ${isComplete ? "bg-[#C5A572]" : "bg-gray-200"}`}></div>
                    )}

                    {/* Node dot */}
                    <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      isComplete ? "bg-[#C5A572] border-[#C5A572]" :
                      isInProgress ? "bg-white border-[#C5A572]" :
                      "bg-white border-gray-300"
                    }`}>
                      {isComplete && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${isComplete || isInProgress ? "text-[#1A1A1A]" : "text-gray-400"}`}>
                          {milestone.name}
                        </p>
                        {milestone.description && (
                          <p className="text-[13px] text-gray-500 mt-0.5">{milestone.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            isComplete ? "bg-green-50 text-green-700" :
                            isInProgress ? "bg-blue-50 text-blue-700" :
                            "bg-gray-50 text-gray-500"
                          }`}>
                            {isComplete ? "Complete" : isInProgress ? "In Progress" : "Planned"}
                          </span>
                          {milestone.date && (
                            <span className="text-[11px] text-gray-400">
                              {new Date(milestone.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          )}
                          {milestone.inspectedAt && (
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-600 text-white font-medium flex items-center gap-1">
                              <HiOutlineCheckCircle className="text-[9px]" /> Approved {new Date(milestone.inspectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                        {milestone.inspectionNotes && (
                          <p className="text-[11px] text-green-700 mt-1 italic">"{milestone.inspectionNotes}"</p>
                        )}
                      </div>

                      {/* Progress indicator for in-progress milestones */}
                      {isInProgress && milestone.progress > 0 && (
                        <div className="text-right ml-4">
                          <span className="text-xs font-medium text-[#C5A572]">{milestone.progress}%</span>
                          <div className="w-16 bg-gray-100 rounded-full h-1.5 mt-1">
                            <div
                              className="h-1.5 rounded-full bg-[#C5A572] transition-all"
                              style={{ width: `${milestone.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right - Site Updates */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-6 self-start">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <HiOutlineCalendar className="text-[#C5A572]" />
            Site Updates
          </h3>
          {updates.length > 0 ? (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {updates.map((update) => {
                const dateKey = new Date(update.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });
                return (
                  <div key={update.id} className="pb-3 border-b border-gray-100 last:border-0">
                    <p className="text-[11px] font-semibold text-[#C5A572] uppercase tracking-wide">{dateKey}</p>
                    <p className="text-[13px] font-medium text-gray-900 mt-1">{update.title}</p>
                    {update.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-3">{update.description}</p>
                    )}
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {new Date(update.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No site updates yet for this project.</p>
          )}
        </div>
        </div>
      )}
    </div>
  );
}
