import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlineSearch, HiOutlinePencil, HiOutlinePlus } from "react-icons/hi";
import { toast } from "react-toastify";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState({
    userId: "",
    name: "",
    address: "",
    status: "PLANNED",
    completionPercentage: 0,
    startDate: "",
    estimatedEndDate: "",
  });

  const fetchProjects = async () => {
    try {
      const res = await api.get("/admin/projects");
      setProjects(res.data.data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/projects", form);
      toast.success("Project created!");
      setShowCreate(false);
      resetForm();
      fetchProjects();
    } catch (err) {
      toast.error("Failed to create project");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/projects/${editProject.id}`, form);
      toast.success("Project updated!");
      setEditProject(null);
      resetForm();
      fetchProjects();
    } catch (err) {
      toast.error("Failed to update project");
    }
  };

  const openEdit = (project) => {
    setEditProject(project);
    setForm({
      userId: project.userId,
      name: project.name,
      address: project.address,
      status: project.status,
      completionPercentage: project.completionPercentage,
      startDate: project.startDate?.split("T")[0] || "",
      estimatedEndDate: project.estimatedEndDate?.split("T")[0] || "",
    });
    setShowCreate(false);
  };

  const resetForm = () => {
    setForm({ userId: "", name: "", address: "", status: "PLANNED", completionPercentage: 0, startDate: "", estimatedEndDate: "" });
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  const statusColors = {
    PLANNED: "bg-gray-100 text-gray-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
    ON_HOLD: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Construction Tracker</h1>
        <button
          onClick={() => { setShowCreate(true); setEditProject(null); resetForm(); }}
          className="bg-[#C5A572] text-white px-4 py-2 rounded-lg hover:bg-[#b39362] transition-colors flex items-center gap-2"
        >
          <HiOutlinePlus className="text-lg" />
          New Project
        </button>
      </div>

      {/* Create/Edit Form */}
      {(showCreate || editProject) && (
        <form onSubmit={editProject ? handleUpdate : handleCreate} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-[#1A1A1A] mb-4">
            {editProject ? "Edit Project" : "Create Project"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {!editProject && (
              <div>
                <label className="block text-sm text-gray-600 mb-1">Assign to User</label>
                <select
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  value={form.userId}
                  onChange={(e) => setForm({ ...form, userId: e.target.value })}
                >
                  <option value="">Select User</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Project Name</label>
              <input
                type="text"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Address</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Completion %</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                value={form.completionPercentage}
                onChange={(e) => setForm({ ...form, completionPercentage: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Estimated End Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                value={form.estimatedEndDate}
                onChange={(e) => setForm({ ...form, estimatedEndDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#C5A572] text-white px-4 py-2 rounded-lg hover:bg-[#b39362]">
              {editProject ? "Update" : "Create"}
            </button>
            <button type="button" onClick={() => { setShowCreate(false); setEditProject(null); resetForm(); }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects or user..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[#1A1A1A]">{project.name}</h3>
                <p className="text-sm text-gray-500">{project.address}</p>
              </div>
              <button onClick={() => openEdit(project)} className="p-2 text-gray-400 hover:text-[#C5A572] hover:bg-gray-100 rounded-lg">
                <HiOutlinePencil />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[project.status] || "bg-gray-100 text-gray-700"}`}>
                {project.status?.replace("_", " ")}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{project.user?.fullName}</span>
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{project.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#C5A572] h-2 rounded-full transition-all"
                  style={{ width: `${project.completionPercentage}%` }}
                ></div>
              </div>
            </div>

            {project.milestones?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">{project.milestones.length} Milestones</p>
                <div className="flex gap-1">
                  {project.milestones.map((m) => (
                    <div
                      key={m.id}
                      className={`h-2 flex-1 rounded-full ${m.status === "COMPLETE" ? "bg-green-400" : m.status === "IN_PROGRESS" ? "bg-blue-400" : "bg-gray-200"}`}
                      title={`${m.name} - ${m.status}`}
                    ></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-10 text-gray-500">No projects found.</div>
      )}
    </div>
  );
}
