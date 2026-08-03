import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/api";
import { HiOutlineEye } from "react-icons/hi";

export default function SupervisorProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/supervisor/projects");
        setProjects(res.data.data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const statusColors = {
    PLANNING: "bg-gray-100 text-gray-600 border-gray-200",
    IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
    ON_HOLD: "bg-yellow-50 text-yellow-700 border-yellow-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
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
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Assigned Projects</h1>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <p className="text-gray-500">No projects assigned yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-[#C5A572]/40 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-[#1A1A1A] font-semibold text-lg">{project.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[project.status] || "bg-gray-100 text-gray-600"}`}>
                  {project.status?.replace("_", " ")}
                </span>
              </div>
              {project.address && (
                <p className="text-gray-500 text-sm mb-3">{project.address}</p>
              )}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{project.completionPercentage || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#C5A572] h-2 rounded-full transition-all"
                    style={{ width: `${project.completionPercentage || 0}%` }}
                  ></div>
                </div>
              </div>
              {project.user && (
                <p className="text-xs text-gray-500 mb-3">Buyer: {project.user.fullName}</p>
              )}
              <button
                onClick={() => navigate(`/supervisor/projects/${project.id}`)}
                className="w-full flex items-center justify-center gap-2 bg-[#C5A572]/10 text-[#C5A572] text-sm font-medium rounded-lg px-3 py-2 hover:bg-[#C5A572]/20 transition-colors border border-[#C5A572]/20"
              >
                <HiOutlineEye className="w-4 h-4" />
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
