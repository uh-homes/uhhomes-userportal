import { useState, useEffect } from "react";
import api from "../Api/api";

export default function SupervisorTimeline() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/supervisor/projects");
        setProjects(res.data.data);
        if (res.data.data.length > 0) setSelectedProject(res.data.data[0]);
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
    const fetchTimeline = async () => {
      try {
        const res = await api.get(`/supervisor/timeline/${selectedProject.id}`);
        setMilestones(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTimeline();
  }, [selectedProject]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Construction Timeline</h1>

      <div className="mb-6">
        <select
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          value={selectedProject?.id || ""}
          onChange={(e) => setSelectedProject(projects.find((p) => p.id === parseInt(e.target.value)))}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-[#1A1A1A] mb-1">{selectedProject.name}</h2>
          <p className="text-sm text-gray-500 mb-4">{selectedProject.address}</p>

          {milestones.length > 0 ? (
            <div className="relative ml-4 mt-4">
              {milestones.sort((a, b) => a.order - b.order).map((milestone, idx) => (
                <div key={milestone.id} className="relative pl-8 pb-6 last:pb-0">
                  {idx < milestones.length - 1 && (
                    <div className="absolute left-[7px] top-3 w-0.5 h-full bg-gray-200"></div>
                  )}
                  <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
                    milestone.status === "COMPLETE" ? "bg-green-500 border-green-500" :
                    milestone.status === "IN_PROGRESS" ? "bg-blue-500 border-blue-500" :
                    "bg-white border-gray-300"
                  }`}></div>
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{milestone.name}</p>
                    {milestone.description && <p className="text-xs text-gray-500">{milestone.description}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        milestone.status === "COMPLETE" ? "bg-green-100 text-green-700" :
                        milestone.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {milestone.status}
                      </span>
                      <span className="text-xs text-gray-400">
                        {milestone.date ? new Date(milestone.date).toLocaleDateString() : "No date"}
                      </span>
                      <span className="text-xs text-gray-400">{milestone.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No milestones for this project yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
