import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineCalendar, HiOutlineCheckCircle } from "react-icons/hi";
import { toast } from "react-toastify";

export default function AdminTimeline() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetail, setProjectDetail] = useState(null);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editMilestone, setEditMilestone] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "PLANNED",
    date: "",
    progress: 0,
    order: 1,
  });

  const fetchProjects = async () => {
    try {
      const res = await api.get("/admin/projects");
      setProjects(res.data.data);
      if (res.data.data.length > 0 && !selectedProject) {
        setSelectedProject(res.data.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetail = async (projectId) => {
    try {
      const res = await api.get(`/admin/projects/${projectId}`);
      setProjectDetail(res.data.data);
    } catch (err) {
      console.error("Failed to fetch project detail:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject?.id) {
      fetchProjectDetail(selectedProject.id);
    }
  }, [selectedProject?.id]);

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/projects/${selectedProject.id}/milestones`, form);
      toast.success("Milestone added!");
      setShowMilestoneForm(false);
      resetForm();
      fetchProjects();
    } catch (err) {
      toast.error("Failed to add milestone");
    }
  };

  const handleUpdateMilestone = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/milestones/${editMilestone.id}`, form);
      toast.success("Milestone updated!");
      setEditMilestone(null);
      resetForm();
      fetchProjects();
    } catch (err) {
      toast.error("Failed to update milestone");
    }
  };

  const openEditMilestone = (milestone) => {
    setEditMilestone(milestone);
    setForm({
      name: milestone.name,
      description: milestone.description || "",
      status: milestone.status,
      date: milestone.date?.split("T")[0] || "",
      progress: milestone.progress,
      order: milestone.order,
    });
    setShowMilestoneForm(false);
  };

  const resetForm = () => {
    setForm({ name: "", description: "", status: "PLANNED", date: "", progress: 0, order: 1 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  const currentProject = projects.find((p) => p.id === selectedProject?.id) || selectedProject;
  const sorted = currentProject?.milestones ? [...currentProject.milestones].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];
  const completedCount = sorted.filter((m) => m.status === "COMPLETE").length;
  const overallProgress = sorted.length > 0 ? Math.round((completedCount / sorted.length) * 100) : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Construction Timeline</h1>

      {/* Project Selector */}
      <div className="mb-6">
        <select
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          value={selectedProject?.id || ""}
          onChange={(e) => setSelectedProject(projects.find((p) => p.id === parseInt(e.target.value)))}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.user?.fullName}
            </option>
          ))}
        </select>
      </div>

      {currentProject && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Construction Tracker */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[#1A1A1A]">{currentProject.name}</h2>
              <p className="text-sm text-gray-500">{currentProject.user?.fullName} • {currentProject.address}</p>
            </div>
            <button
              onClick={() => { setShowMilestoneForm(true); setEditMilestone(null); resetForm(); }}
              className="bg-[#C5A572] text-white px-3 py-2 rounded-lg hover:bg-[#b39362] flex items-center gap-1 text-sm"
            >
              <HiOutlinePlus /> Add Milestone
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xs text-gray-500">{completedCount} of {sorted.length} complete</span>
            <span className="text-xs font-medium text-[#C5A572]">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#C5A572] to-[#D4AF37] transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>

          {/* Milestone Form */}
          {(showMilestoneForm || editMilestone) && (
            <form onSubmit={editMilestone ? handleUpdateMilestone : handleAddMilestone} className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-sm mb-3">{editMilestone ? "Edit Milestone" : "New Milestone"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Foundation"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETE">Complete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.progress}
                    onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Order</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-[#C5A572] text-white px-3 py-1.5 rounded-lg text-sm">
                  {editMilestone ? "Update" : "Add"}
                </button>
                <button type="button" onClick={() => { setShowMilestoneForm(false); setEditMilestone(null); resetForm(); }} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Timeline */}
          <div className="relative ml-4 mt-4">
            {sorted.map((milestone, idx) => {
              const isComplete = milestone.status === "COMPLETE";
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
                    milestone.inspectedAt ? "bg-[#C5A572] border-[#C5A572]" :
                    isComplete ? "bg-[#C5A572] border-[#C5A572]" :
                    isInProgress ? "bg-white border-[#C5A572]" :
                    "bg-white border-gray-300"
                  }`}>
                    {(isComplete || milestone.inspectedAt) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isComplete || isInProgress ? "text-[#1A1A1A]" : "text-gray-400"}`}>{milestone.name}</p>
                      {milestone.description && <p className="text-[13px] text-gray-500 mt-0.5">{milestone.description}</p>}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          isComplete ? "bg-green-50 text-green-700" :
                          isInProgress ? "bg-blue-50 text-blue-700" :
                          "bg-gray-50 text-gray-500"
                        }`}>
                          {isComplete ? "Complete" : isInProgress ? "In Progress" : "Planned"}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {milestone.date ? new Date(milestone.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No date"}
                        </span>
                        {isInProgress && <span className="text-[11px] font-medium text-[#C5A572]">{milestone.progress}%</span>}
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

                    {/* Progress indicator for in-progress */}
                    {isInProgress && milestone.progress > 0 && (
                      <div className="text-right ml-3">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full bg-[#C5A572] transition-all" style={{ width: `${milestone.progress}%` }} />
                        </div>
                      </div>
                    )}

                    <button onClick={() => openEditMilestone(milestone)} className="p-1.5 text-gray-400 hover:text-[#C5A572] rounded ml-2">
                      <HiOutlinePencil className="text-sm" />
                    </button>
                  </div>
                </div>
              );
            })}
            {sorted.length === 0 && (
              <p className="text-gray-500 text-sm">No milestones yet. Add one above.</p>
            )}
          </div>

        </div>

        {/* Right - Site Updates */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 sticky top-6 self-start">
          <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <HiOutlineCalendar className="text-[#C5A572]" />
            Site Updates
          </h3>
          {projectDetail?.updates && projectDetail.updates.length > 0 ? (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {projectDetail.updates.map((update) => {
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
