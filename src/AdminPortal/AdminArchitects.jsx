import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlinePencilAlt,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineSearch,
  HiOutlineClipboardList,
} from "react-icons/hi";

export default function AdminArchitects() {
  const [architects, setArchitects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(null);
  const [newArchitect, setNewArchitect] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [creating, setCreating] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [archRes, projRes] = await Promise.all([
        api.get("/admin/architects"),
        api.get("/admin/projects"),
      ]);
      setArchitects(archRes.data.data || []);
      setProjects(projRes.data.data || []);
    } catch (err) {
      toast.error("Failed to load data");
      setArchitects([]);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newArchitect.fullName || !newArchitect.email || !newArchitect.password) {
      toast.error("Full name, email, and password are required.");
      return;
    }
    setCreating(true);
    try {
      const payload = {
        fullName: newArchitect.fullName,
        email: newArchitect.email,
        phone: newArchitect.phone || undefined,
        password: newArchitect.password,
        role: "user",
      };
      const res = await api.post("/admin/users", payload);
      await api.put(`/admin/permissions/category/${res.data.data.id}`, { category: "architect" });
      toast.success(`Architect "${newArchitect.fullName}" created successfully`);
      setShowCreate(false);
      setNewArchitect({ fullName: "", email: "", phone: "", password: "" });
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create architect");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this architect?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success("Architect removed");
      setArchitects((prev) => prev.filter((a) => a.id !== id && a._id !== id));
    } catch (err) {
      toast.error("Failed to remove architect");
    }
  };

  const handleAssignProjects = async () => {
    if (!showAssign) return;
    try {
      await api.put(`/admin/architects/${showAssign.id || showAssign._id}/projects`, {
        projectIds: selectedProjects,
      });
      toast.success("Projects assigned successfully");
      setShowAssign(null);
      setSelectedProjects([]);
      await fetchData();
    } catch (err) {
      toast.error("Failed to assign projects");
    }
  };

  const filteredArchitects = architects.filter(
    (a) =>
      a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.email?.toLowerCase().includes(search.toLowerCase())
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <HiOutlinePencilAlt className="text-[#C5A572]" />
            Architects
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage architects and assign them to projects</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors shadow-sm"
        >
          <HiOutlinePlus className="text-base" /> Add Architect
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search architects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
        />
      </div>

      {/* Architect List */}
      {filteredArchitects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HiOutlinePencilAlt className="mx-auto text-4xl mb-3" />
          <p className="text-lg font-medium">No architects registered</p>
          <p className="text-sm">Create an architect account to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArchitects.map((architect) => (
            <div key={architect.id || architect._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C5A572] flex items-center justify-center text-white font-semibold text-sm">
                    {architect.fullName?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1A1A1A]">{architect.fullName}</h3>
                    <p className="text-xs text-gray-400">{architect.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(architect.id || architect._id)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <HiOutlineTrash className="text-sm" />
                </button>
              </div>
              {architect.assignedProjects && architect.assignedProjects.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Assigned Projects</p>
                  <div className="flex flex-wrap gap-1">
                    {architect.assignedProjects.map((p, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {p.name || p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  setShowAssign(architect);
                  setSelectedProjects(architect.assignedProjects?.map((p) => p.id || p._id || p) || []);
                }}
                className="w-full mt-2 px-3 py-2 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
              >
                <HiOutlineClipboardList /> Assign Projects
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Add New Architect</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                <HiOutlineX className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newArchitect.fullName}
                  onChange={(e) => setNewArchitect({ ...newArchitect, fullName: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="Architect Name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input
                  type="email"
                  value={newArchitect.email}
                  onChange={(e) => setNewArchitect({ ...newArchitect, email: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="architect@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newArchitect.phone}
                  onChange={(e) => setNewArchitect({ ...newArchitect, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
                <input
                  type="password"
                  value={newArchitect.password}
                  onChange={(e) => setNewArchitect({ ...newArchitect, password: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="Set a password"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Architect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Projects Modal */}
      {showAssign && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowAssign(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Assign Projects to {showAssign.fullName}</h2>
              <button onClick={() => setShowAssign(null)} className="text-gray-400 hover:text-gray-600">
                <HiOutlineX className="text-xl" />
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
              {projects.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No projects available</p>
              ) : (
                projects.map((project) => (
                  <label
                    key={project.id || project._id}
                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProjects.includes(project.id || project._id)}
                      onChange={(e) => {
                        const id = project.id || project._id;
                        if (e.target.checked) {
                          setSelectedProjects([...selectedProjects, id]);
                        } else {
                          setSelectedProjects(selectedProjects.filter((p) => p !== id));
                        }
                      }}
                      className="w-4 h-4 text-[#C5A572] rounded border-gray-300 focus:ring-[#C5A572]"
                    />
                    <span className="text-sm text-[#1A1A1A]">{project.name}</span>
                  </label>
                ))
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAssign(null)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignProjects}
                className="flex-1 px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
