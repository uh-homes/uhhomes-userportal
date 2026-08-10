import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import { HiOutlineDocumentText, HiOutlineUpload, HiOutlineDownload } from "react-icons/hi";

export default function PMDocuments() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/pm/projects");
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
    if (selectedProject) fetchDocuments();
  }, [selectedProject]);

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/pm/projects/${selectedProject}/documents`);
      setDocuments(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);

    setUploading(true);
    try {
      await api.post(`/pm/projects/${selectedProject}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded");
      fetchDocuments();
    } catch (err) {
      toast.error("Failed to upload document");
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
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
        <HiOutlineDocumentText className="text-[#C5A572]" /> Project Documents
      </h1>

      <div className="flex items-center gap-4 mb-4">
        {projects.length > 0 && (
          <select
            value={selectedProject || ""}
            onChange={(e) => setSelectedProject(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}

        <label className="flex items-center gap-1.5 px-4 py-2 bg-[#C5A572] text-white text-sm rounded-lg hover:bg-[#b39362] cursor-pointer transition-colors">
          <HiOutlineUpload /> {uploading ? "Uploading..." : "Upload"}
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {documents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <HiOutlineDocumentText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No documents for this project yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <HiOutlineDocumentText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">{doc.name}</p>
                    <p className="text-xs text-gray-400">{doc.type} &bull; {new Date(doc.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-[#C5A572] hover:text-[#b39362]">
                    <HiOutlineDownload className="w-5 h-5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
