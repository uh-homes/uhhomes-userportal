import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";

export default function SupervisorIssues() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [fetchingProjects, setFetchingProjects] = useState(true);
  const [escalating, setEscalating] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/supervisor/projects");
        setProjects(res.data.data);
        if (res.data.data.length > 0) setSelectedProject(res.data.data[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setFetchingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const handleLogIssue = async (e) => {
    e.preventDefault();
    if (!selectedProject || !title) return;
    setLoading(true);
    try {
      await api.post(`/supervisor/projects/${selectedProject}/issues`, { title, description, severity });
      toast.success("Issue logged and buyer notified!");
      setTitle("");
      setDescription("");
    } catch (err) {
      toast.error("Failed to log issue.");
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!selectedProject || !title) {
      toast.error("Please fill in the title before escalating.");
      return;
    }
    setEscalating(true);
    try {
      await api.post(`/supervisor/projects/${selectedProject}/escalate`, { title, description });
      toast.success("Issue escalated to Admin!");
      setTitle("");
      setDescription("");
    } catch (err) {
      toast.error("Failed to escalate.");
    } finally {
      setEscalating(false);
    }
  };

  if (fetchingProjects) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Issues & Delays</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <form onSubmit={handleLogIssue} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Material delivery delayed"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Describe the issue or delay in detail..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !title}
              className="bg-[#C5A572] text-white font-medium px-6 py-2.5 rounded-lg hover:bg-[#b39362] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Logging..." : "Log Issue"}
            </button>
            <button
              type="button"
              onClick={handleEscalate}
              disabled={escalating || !title}
              className="bg-red-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {escalating ? "Escalating..." : "Escalate to Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
