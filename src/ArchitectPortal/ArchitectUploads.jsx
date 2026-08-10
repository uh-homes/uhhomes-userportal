import { useEffect, useState, useRef } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlinePhotograph,
  HiOutlineUpload,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineDownload,
} from "react-icons/hi";

const FILE_CATEGORIES = [
  { key: "floorplan", label: "Floor Plans" },
  { key: "elevation", label: "Elevations" },
  { key: "3d_render", label: "3D Renders" },
  { key: "blueprint", label: "Blueprints" },
  { key: "other", label: "Other" },
];

export default function ArchitectUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({ category: "floorplan", projectId: "", description: "" });
  const [projects, setProjects] = useState([]);
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    fetchUploads();
    fetchProjects();
  }, []);

  const fetchUploads = async () => {
    try {
      const res = await api.get("/architect/uploads");
      setUploads(res.data.data || []);
    } catch (err) {
      setUploads([]);
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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      formData.append("category", uploadData.category);
      formData.append("description", uploadData.description);
      if (uploadData.projectId) formData.append("projectId", uploadData.projectId);

      await api.post("/architect/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${selectedFiles.length} file(s) uploaded successfully`);
      setShowUploadModal(false);
      setSelectedFiles([]);
      setUploadData({ category: "floorplan", projectId: "", description: "" });
      await fetchUploads();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (uploadId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await api.delete(`/architect/uploads/${uploadId}`);
      toast.success("File deleted");
      setUploads((prev) => prev.filter((u) => u.id !== uploadId && u._id !== uploadId));
    } catch (err) {
      toast.error("Failed to delete file");
    }
  };

  const filteredUploads = uploads.filter((u) => {
    const matchesSearch =
      u.fileName?.toLowerCase().includes(search.toLowerCase()) ||
      u.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === "all" || u.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (key) => FILE_CATEGORIES.find((c) => c.key === key)?.label || key;
  const getCategoryColor = (key) => {
    switch (key) {
      case "floorplan": return "bg-blue-100 text-blue-700";
      case "elevation": return "bg-green-100 text-green-700";
      case "3d_render": return "bg-purple-100 text-purple-700";
      case "blueprint": return "bg-orange-100 text-orange-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

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
            <HiOutlinePhotograph className="text-[#C5A572]" />
            Uploads
          </h1>
          <p className="text-sm text-gray-500 mt-1">Upload and manage floorplans, elevations, and 3D renders</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors shadow-sm"
        >
          <HiOutlineUpload className="text-base" /> Upload Files
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search uploads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {FILE_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Upload Grid */}
      {filteredUploads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HiOutlinePhotograph className="mx-auto text-4xl mb-3" />
          <p className="text-lg font-medium">No uploads yet</p>
          <p className="text-sm">Upload floorplans, elevations, and 3D renders to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUploads.map((upload) => (
            <div key={upload.id || upload._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div className="w-full h-40 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {upload.thumbnailUrl || upload.fileUrl ? (
                  <img
                    src={upload.thumbnailUrl || upload.fileUrl}
                    alt={upload.fileName}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <HiOutlinePhotograph className="text-4xl text-gray-300" />
                )}
              </div>
              <h4 className="text-sm font-medium text-[#1A1A1A] truncate">{upload.fileName}</h4>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoryColor(upload.category)}`}>
                  {getCategoryLabel(upload.category)}
                </span>
                {upload.projectName && (
                  <span className="text-xs text-gray-400 truncate">{upload.projectName}</span>
                )}
              </div>
              {upload.createdAt && (
                <p className="text-xs text-gray-400 mt-1">{new Date(upload.createdAt).toLocaleDateString()}</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                {upload.fileUrl && (
                  <a
                    href={upload.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="View"
                  >
                    <HiOutlineEye className="text-sm" />
                  </a>
                )}
                {upload.fileUrl && (
                  <a
                    href={upload.fileUrl}
                    download
                    className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                    title="Download"
                  >
                    <HiOutlineDownload className="text-sm" />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(upload.id || upload._id)}
                  className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <HiOutlineTrash className="text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Upload Files</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                >
                  {FILE_CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Project (Optional)</label>
                <select
                  value={uploadData.projectId}
                  onChange={(e) => setUploadData({ ...uploadData, projectId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                >
                  <option value="">No project selected</option>
                  {projects.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent resize-none"
                  placeholder="Brief description of the files..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Files *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-[#C5A572] transition-colors"
                >
                  <HiOutlineUpload className="mx-auto text-2xl text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click to select files</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, PNG, JPG, DWG, SKP supported</p>
                  {selectedFiles.length > 0 && (
                    <p className="text-sm text-[#C5A572] font-medium mt-2">{selectedFiles.length} file(s) selected</p>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.dwg,.skp,.obj,.fbx,.3ds"
                  onChange={handleFileSelect}
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
                  disabled={uploading || selectedFiles.length === 0}
                  className="flex-1 px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
