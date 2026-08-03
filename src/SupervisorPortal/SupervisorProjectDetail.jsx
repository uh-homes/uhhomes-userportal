import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/api";
import { HiArrowLeft, HiOutlinePlusCircle } from "react-icons/hi";

export default function SupervisorProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/supervisor/projects/${id}`);
        setProject(res.data.data);
        setProgressValue(res.data.data.completionPercentage || 0);
      } catch (err) {
        console.error("Failed to fetch project:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleUpdateProgress = async () => {
    setUpdating(true);
    try {
      await api.put(`/supervisor/projects/${id}/progress`, { completionPercentage: progressValue });
      setProject((prev) => ({ ...prev, completionPercentage: progressValue }));
    } catch (err) {
      console.error("Failed to update progress:", err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  if (!project) {
    return <p className="text-gray-500 p-6">Project not found.</p>;
  }

  const statusColors = {
    PLANNING: "bg-gray-100 text-gray-600 border-gray-200",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
    ON_HOLD: "bg-yellow-50 text-yellow-700 border-yellow-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate("/supervisor/projects")}
        className="flex items-center gap-2 text-gray-500 hover:text-[#1A1A1A] mb-4 transition-colors"
      >
        <HiArrowLeft className="w-4 h-4" /> Back to Projects
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">{project.name}</h1>
            {project.address && <p className="text-gray-500 mt-1">{project.address}</p>}
          </div>
          <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[project.status] || ""}`}>
            {project.status?.replace("_", " ")}
          </span>
        </div>

        {project.user && (
          <p className="text-sm text-gray-500 mb-4">
            Buyer: <span className="text-[#1A1A1A] font-medium">{project.user.fullName}</span> ({project.user.email})
          </p>
        )}

        {/* Progress update */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Update Progress</h3>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progressValue}
              onChange={(e) => setProgressValue(parseInt(e.target.value))}
              className="flex-1 accent-[#C5A572]"
            />
            <span className="text-[#1A1A1A] font-bold text-lg w-12 text-right">{progressValue}%</span>
            <button
              onClick={handleUpdateProgress}
              disabled={updating}
              className="bg-[#C5A572] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#b39362] disabled:opacity-60 transition-colors"
            >
              {updating ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Milestones</h2>
          <button
            onClick={() => navigate(`/supervisor/projects/${id}/milestone/new`)}
            className="flex items-center gap-1 text-sm text-[#C5A572] hover:text-[#b39362] transition-colors"
          >
            <HiOutlinePlusCircle className="w-4 h-4" /> Add
          </button>
        </div>
        {project.milestones?.length > 0 ? (
          <div className="space-y-3">
            {project.milestones.map((m) => (
              <div key={m.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-[#1A1A1A] font-medium">{m.name}</p>
                  {m.description && <p className="text-gray-500 text-sm mt-1">{m.description}</p>}
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[m.status] || "bg-gray-100 text-gray-600"}`}>
                    {m.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{m.progress || 0}%</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No milestones yet.</p>
        )}
      </div>

      {/* Recent Updates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Recent Updates</h2>
        {project.updates?.length > 0 ? (
          <div className="space-y-3">
            {project.updates.slice(0, 5).map((u) => (
              <div key={u.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-[#1A1A1A] font-medium">{u.title}</p>
                <p className="text-gray-500 text-sm mt-1">{u.description}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(u.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No updates yet.</p>
        )}
      </div>
    </div>
  );
}
