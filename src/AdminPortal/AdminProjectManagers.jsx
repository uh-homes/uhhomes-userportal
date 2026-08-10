import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlineBriefcase,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineCheck,
  HiOutlineSearch,
} from "react-icons/hi";

export default function AdminProjectManagers() {
  const [managers, setManagers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [newPM, setNewPM] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pmRes, projRes] = await Promise.all([
        api.get("/admin/project-managers"),
        api.get("/admin/projects"),
      ]);
      setManagers(pmRes.data.data);
      setProjects(projRes.data.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPM.fullName || !newPM.email || !newPM.password) {
      toast.error("Full name, email, and password are required.");
      return;
    }
    setCreating(true);
    try {
      await api.post("/admin/project-managers", newPM);
      toast.success(`Project Manager "${newPM.fullName}" created successfully`);
      setShowCreate(false);
      setNewPM({ fullName: "", email: "", phone: "", password: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create project manager");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete Project Manager "${name}"? This will remove all project assignments.`)) return;
    try {
      await api.delete(`/admin/project-managers/${id}`);
      toast.success("Project Manager deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete project manager");
    }
  };

  const handleAssign = async (managerId) => {
    if (selectedProjects.length === 0) {
      toast.error("Select at least one project");
      return;
    }
    try {
      await api.post(`/admin/project-managers/${managerId}/assign`, { projectIds: selectedProjects });
      toast.success("Projects assigned successfully");
      setShowAssign(null);
      setSelectedProjects([]);
      fetchData();
    } catch (err) {
      toast.error("Failed to assign projects");
    }
  };

  const handleUnassign = async (managerId, projectId, projectName) => {
    if (!window.confirm(`Unassign project "${projectName}" from this manager?`)) return;
    try {
      await api.delete(`/admin/project-managers/${managerId}/unassign/${projectId}`);
      toast.success("Project unassigned");
      fetchData();
    } catch (err) {
      toast.error("Failed to unassign project");
    }
  };

  const toggleProject = (projectId) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId]
    );
  };

  const filteredManagers = managers.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <HiOutlineBriefcase className="text-[#C5A572]" />
            Project Managers
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create project managers and assign them to projects. They can oversee milestones, respond to buyer inquiries, and manage documents.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors shadow-sm"
        >
          <HiOutlinePlus className="text-base" /> Add Project Manager
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search managers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
        />
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Create Project Manager</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newPM.fullName}
                  onChange={(e) => setNewPM({ ...newPM, fullName: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input
                  type="email"
                  value={newPM.email}
                  onChange={(e) => setNewPM({ ...newPM, email: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="pm@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={newPM.phone}
                  onChange={(e) => setNewPM({ ...newPM, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
                <input
                  type="password"
                  value={newPM.password}
                  onChange={(e) => setNewPM({ ...newPM, password: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-sm text-white bg-[#C5A572] rounded-lg hover:bg-[#b39362] disabled:opacity-60 transition-colors flex items-center gap-1.5"
                >
                  {creating && <span className="h-3.5 w-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></span>}
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => { setShowAssign(null); setSelectedProjects([]); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Assign Projects</h2>
            <p className="text-sm text-gray-500 mb-3">Select projects to assign to this Project Manager:</p>
            <div className="space-y-2 mb-4">
              {projects.map((project) => {
                const alreadyAssigned = managers
                  .find((m) => m.id === showAssign)
                  ?.managedProjects?.some((p) => p.id === project.id);
                return (
                  <label
                    key={project.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      alreadyAssigned
                        ? "border-green-200 bg-green-50 opacity-60 cursor-not-allowed"
                        : selectedProjects.includes(project.id)
                        ? "border-[#C5A572] bg-[#FAF7F2]"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id) || alreadyAssigned}
                      disabled={alreadyAssigned}
                      onChange={() => !alreadyAssigned && toggleProject(project.id)}
                      className="w-4 h-4 text-[#C5A572] rounded focus:ring-[#C5A572]"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1A1A1A]">{project.name}</p>
                      {alreadyAssigned && <p className="text-xs text-green-600">Already assigned</p>}
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowAssign(null); setSelectedProjects([]); }}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssign(showAssign)}
                disabled={selectedProjects.length === 0}
                className="px-4 py-2 text-sm text-white bg-[#C5A572] rounded-lg hover:bg-[#b39362] disabled:opacity-60"
              >
                Assign ({selectedProjects.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Managers List */}
      {filteredManagers.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <HiOutlineBriefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No project managers found.</p>
          <p className="text-sm mt-1">Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredManagers.map((pm) => (
            <div key={pm.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C5A572] flex items-center justify-center text-white font-semibold text-sm">
                    {pm.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#1A1A1A]">{pm.fullName}</h3>
                    <p className="text-sm text-gray-500">{pm.email}</p>
                    {pm.phone && <p className="text-xs text-gray-400">{pm.phone}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setShowAssign(pm.id); setSelectedProjects([]); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    <HiOutlinePlus className="text-sm" /> Assign Projects
                  </button>
                  <button
                    onClick={() => handleDelete(pm.id, pm.fullName)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Assigned Projects */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Assigned Projects ({pm.managedProjects?.length || 0})
                </p>
                {pm.managedProjects && pm.managedProjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {pm.managedProjects.map((project) => (
                      <span
                        key={project.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FAF7F2] text-[#8B7355] text-xs rounded-full border border-[#E8D5B5]"
                      >
                        {project.name}
                        <button
                          onClick={() => handleUnassign(pm.id, project.id, project.name)}
                          className="ml-0.5 text-red-400 hover:text-red-600"
                          title="Unassign"
                        >
                          <HiOutlineX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No projects assigned yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
