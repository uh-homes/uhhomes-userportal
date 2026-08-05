import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../Api/api";
import { HiArrowLeft } from "react-icons/hi";

export default function SupervisorProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/supervisor/projects/${id}`);
        setProject(res.data.data);
      } catch (err) {
        console.error("Failed to fetch project:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

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

        {/* Progress */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span className="font-semibold text-[#1A1A1A]">{project.completionPercentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#C5A572] h-2.5 rounded-full transition-all"
              style={{ width: `${project.completionPercentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Milestones</h2>
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
