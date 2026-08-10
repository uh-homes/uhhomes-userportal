import { useEffect, useState, useRef } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlineDocumentText,
  HiOutlineUpload,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlinePencil,
  HiOutlineDownload,
  HiOutlinePlus,
} from "react-icons/hi";

export default function ArchitectFloorPlans() {
  const [floorPlans, setFloorPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [uploadData, setUploadData] = useState({ name: "", projectId: "", version: "1.0", notes: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchFloorPlans();
    fetchProjects();
  }, []);

  const fetchFloorPlans = async () => {
    try {
      const res = await api.get("/architect/floorplans");
      setFloorPlans(res.data.data || []);
    } catch (err) {
      setFloorPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get("/architect/projects");
      setProjects(res.data.data || []);
    } catch (err) {
      setProjects([]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadData.name) {
      toast.error("Name and file are required");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", uploadData.name);
      formData.append("version", uploadData.version);
      formData.append("notes", uploadData.notes);
      if (uploadData.projectId) formData.append("projectId", uploadData.projectId);

      await api.post("/architect/floorplans", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Floor plan uploaded successfully");
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadData({ name: "", projectId: "", version: "1.0", notes: "" });
      await fetchFloorPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload floor plan");
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    try {
      await api.put(`/architect/floorplans/${editingPlan.id || editingPlan._id}`, {
        name: editingPlan.name,
        version: editingPlan.version,
        notes: editingPlan.notes,
      });
      toast.success("Floor plan updated");
      setShowEditModal(false);
      setEditingPlan(null);
      await fetchFloorPlans();
    } catch (err) {
      toast.error("Failed to update floor plan");
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this floor plan?")) return;
    try {
      await api.delete(`/architect/floorplans/${planId}`);
      toast.success("Floor plan deleted");
      setFloorPlans((prev) => prev.filter((p) => p.id !== planId && p._id !== planId));
    } catch (err) {
      toast.error("Failed to delete floor plan");
    }
  };

  const filteredPlans = floorPlans.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.projectName?.toLowerCase().includes(search.toLowerCase())
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
            <HiOutlineDocumentText className="text-[#C5A572]" />
            Floor Plans
          </h1>
          <p className="text-sm text-gray-500 mt-1">Upload, manage, and version your floor plans</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors shadow-sm"
        >
          <HiOutlinePlus className="text-base" /> Add Floor Plan
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search floor plans..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
        />
      </div>

      {/* Floor Plans Table */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HiOutlineDocumentText className="mx-auto text-4xl mb-3" />
          <p className="text-lg font-medium">No floor plans yet</p>
          <p className="text-sm">Upload your first floor plan to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Project</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Version</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id || plan._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <HiOutlineDocumentText className="text-[#C5A572]" />
                        <span className="text-sm font-medium text-[#1A1A1A]">{plan.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{plan.projectName || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">v{plan.version}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {plan.fileUrl && (
                          <a
                            href={plan.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                            title="View"
                          >
                            <HiOutlineEye className="text-sm" />
                          </a>
                        )}
                        {plan.fileUrl && (
                          <a
                            href={plan.fileUrl}
                            download
                            className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Download"
                          >
                            <HiOutlineDownload className="text-sm" />
                          </a>
                        )}
                        <button
                          onClick={() => { setEditingPlan({ ...plan }); setShowEditModal(true); }}
                          className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                          title="Edit"
                        >
                          <HiOutlinePencil className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id || plan._id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete"
                        >
                          <HiOutlineTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Add Floor Plan</h2>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                <input
                  type="text"
                  value={uploadData.name}
                  onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="e.g. Ground Floor Layout"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Project</label>
                <select
                  value={uploadData.projectId}
                  onChange={(e) => setUploadData({ ...uploadData, projectId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                >
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Version</label>
                <input
                  type="text"
                  value={uploadData.version}
                  onChange={(e) => setUploadData({ ...uploadData, version: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="1.0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={uploadData.notes}
                  onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent resize-none"
                  placeholder="Any notes about this floor plan..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">File *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-[#C5A572] transition-colors"
                >
                  <HiOutlineUpload className="mx-auto text-xl text-gray-400 mb-1" />
                  <p className="text-sm text-gray-500">{selectedFile ? selectedFile.name : "Click to select file"}</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG, DWG supported</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.dwg,.skp"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="hidden"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPlan && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Edit Floor Plan</h2>
            <form onSubmit={handleEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Version</label>
                <input
                  type="text"
                  value={editingPlan.version}
                  onChange={(e) => setEditingPlan({ ...editingPlan, version: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={editingPlan.notes || ""}
                  onChange={(e) => setEditingPlan({ ...editingPlan, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
