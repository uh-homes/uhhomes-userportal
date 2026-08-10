import { useEffect, useState } from "react";
import api from "../Api/api";
import { HiOutlineClock } from "react-icons/hi";

export default function PMTimeline() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

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
    if (selectedProject) fetchTimeline();
  }, [selectedProject]);

  const fetchTimeline = async () => {
    try {
      const res = await api.get(`/pm/timeline/${selectedProject}`);
      setMilestones(res.data.data);
    } catch (err) {
      console.error(err);
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
        <HiOutlineClock className="text-[#C5A572]" /> Construction Timeline
      </h1>

      {projects.length > 0 && (
        <div className="mb-6">
          <select
            value={selectedProject || ""}
            onChange={(e) => setSelectedProject(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="relative">
        {milestones.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <HiOutlineClock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No timeline data for this project.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {milestones.map((milestone, idx) => (
              <div key={milestone.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    milestone.status === "COMPLETED" ? "bg-green-500 border-green-500" :
                    milestone.status === "IN_PROGRESS" ? "bg-[#C5A572] border-[#C5A572]" :
                    "bg-white border-gray-300"
                  }`}></div>
                  {idx < milestones.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 min-h-[40px]"></div>
                  )}
                </div>
                <div className="pb-6 flex-1">
                  <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#1A1A1A]">{milestone.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        milestone.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                        milestone.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {milestone.status}
                      </span>
                    </div>
                    {milestone.description && <p className="text-xs text-gray-500 mt-1">{milestone.description}</p>}
                    {milestone.date && <p className="text-xs text-gray-400 mt-2">{new Date(milestone.date).toLocaleDateString()}</p>}
                    {milestone.progress > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className="bg-[#C5A572] h-1.5 rounded-full" style={{ width: `${milestone.progress}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
