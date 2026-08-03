import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import { HiOutlineDocumentText, HiOutlineUpload } from "react-icons/hi";

export default function SupervisorDocuments() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/supervisor/projects");
        setProjects(res.data.data);
        if (res.data.data.length > 0) setSelectedProject(res.data.data[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    const fetchDocs = async () => {
      try {
        const res = await api.get(`/supervisor/projects/${selectedProject}/documents`);
        setDocuments(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDocs();
  }, [selectedProject]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title || file.name);
      await api.post(`/supervisor/projects/${selectedProject}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded!");
      setShowUpload(false);
      setTitle("");
      setFile(null);
      // Refresh docs
      const res = await api.get(`/supervisor/projects/${selectedProject}/documents`);
      setDocuments(res.data.data);
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Project Documents</h1>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 bg-[#C5A572] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#b39362] transition-colors shadow-sm"
        >
          <HiOutlineUpload className="w-4 h-4" /> Upload
        </button>
      </div>

      <div className="mb-4">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {showUpload && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4 max-w-lg">
          <form onSubmit={handleUpload} className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title (optional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
            />
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-gray-600 text-sm"
            />
            <button
              type="submit"
              disabled={uploading || !file}
              className="bg-[#C5A572] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#b39362] disabled:opacity-60 transition-colors"
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </form>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <p className="text-gray-500">No documents for this project.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#C5A572]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <HiOutlineDocumentText className="w-5 h-5 text-[#C5A572]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1A1A1A] font-medium truncate">{doc.title}</p>
                <p className="text-xs text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</p>
              </div>
              {doc.url && (
                <a
                  href={`${import.meta.env.VITE_API_URL}${doc.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#C5A572] hover:text-[#b39362] font-medium transition-colors"
                >
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
