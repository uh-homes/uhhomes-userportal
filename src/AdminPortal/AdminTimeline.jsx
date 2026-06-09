import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlinePlus, HiOutlinePencil } from "react-icons/hi";
import { toast } from "react-toastify";

export default function AdminTimeline() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
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

  useEffect(() => {
    fetchProjects();
  }, []);

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Construction Timeline</h1>

      {/* Project Selector */}
      <div className="mb-6">
        <select
          className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
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
            {currentProject.milestones?.sort((a, b) => a.order - b.order).map((milestone, idx) => (
              <div key={milestone.id} className="relative pl-8 pb-6 last:pb-0">
                {idx < currentProject.milestones.length - 1 && (
                  <div className="absolute left-[7px] top-3 w-0.5 h-full bg-gray-200"></div>
                )}
                <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${milestone.status === "COMPLETE" ? "bg-green-500 border-green-500" : milestone.status === "IN_PROGRESS" ? "bg-blue-500 border-blue-500" : "bg-white border-gray-300"}`}></div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{milestone.name}</p>
                    <p className="text-xs text-gray-500">{milestone.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${milestone.status === "COMPLETE" ? "bg-green-100 text-green-700" : milestone.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                        {milestone.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {milestone.date ? new Date(milestone.date).toLocaleDateString() : "No date"}
                      </span>
                      <span className="text-xs text-gray-400">{milestone.progress}%</span>
                    </div>
                  </div>
                  <button onClick={() => openEditMilestone(milestone)} className="p-1.5 text-gray-400 hover:text-[#C5A572] rounded">
                    <HiOutlinePencil className="text-sm" />
                  </button>
                </div>
              </div>
            ))}
            {(!currentProject.milestones || currentProject.milestones.length === 0) && (
              <p className="text-gray-500 text-sm">No milestones yet. Add one above.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
