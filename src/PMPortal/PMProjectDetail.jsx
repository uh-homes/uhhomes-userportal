import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../Api/api";
import { toast } from "react-toastify";
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineCheck } from "react-icons/hi";

export default function PMProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ name: "", description: "", date: "", status: "PLANNED" });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/pm/projects/${id}`);
      setProject(res.data.data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/pm/projects/${id}/milestones`, newMilestone);
      toast.success("Milestone added successfully");
      setShowAddMilestone(false);
      setNewMilestone({ name: "", description: "", date: "", status: "PLANNED" });
      fetchProject();
    } catch (err) {
      toast.error("Failed to add milestone");
    }
  };

  const handleUpdateMilestone = async (milestoneId, updates) => {
    try {
      await api.put(`/pm/milestones/${milestoneId}`, updates);
      toast.success("Milestone updated");
      fetchProject();
    } catch (err) {
      toast.error("Failed to update milestone");
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
    return <div className="p-6 text-center text-gray-500">Project not found.</div>;
  }

  const milestones = project.milestones || [];
  const completed = milestones.filter((m) => m.status === "COMPLETED").length;
  const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;

  return (
    <div className="p-6">
      <Link to="/pm/projects" className="flex items-center gap-1 text-sm text-[#C5A572] hover:text-[#b39362] mb-4">
        <HiOutlineArrowLeft /> Back to Projects
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">{project.name}</h1>
            {project.user && (
              <p className="text-sm text-gray-500 mt-1">
                Buyer: {project.user.fullName} ({project.user.email})
              </p>
            )}
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${
            project.status === "COMPLETED" ? "bg-green-100 text-green-700" :
            project.status === "IN_PROGRESS" || project.status === "ACTIVE" ? "bg-blue-100 text-blue-700" :
            "bg-gray-100 text-gray-600"
          }`}>
            {project.status || "PLANNED"}
          </span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-[#C5A572] h-3 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Milestones ({milestones.length})</h2>
          <button
            onClick={() => setShowAddMilestone(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#C5A572] text-white text-sm rounded-lg hover:bg-[#b39362] transition-colors"
          >
            <HiOutlinePlus /> Add Milestone
          </button>
        </div>

        {showAddMilestone && (
          <form onSubmit={handleAddMilestone} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Milestone name"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                required
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
              />
              <input
                type="date"
                value={newMilestone.date}
                onChange={(e) => setNewMilestone({ ...newMilestone, date: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
              />
              <input
                type="text"
                placeholder="Description"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] md:col-span-2"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button type="submit" className="px-4 py-2 bg-[#C5A572] text-white text-sm rounded-lg hover:bg-[#b39362]">
                Add
              </button>
              <button type="button" onClick={() => setShowAddMilestone(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div key={milestone.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
              <button
                onClick={() => handleUpdateMilestone(milestone.id, {
                  status: milestone.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED",
                })}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  milestone.status === "COMPLETED"
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-gray-300 hover:border-[#C5A572]"
                }`}
              >
                {milestone.status === "COMPLETED" && <HiOutlineCheck className="w-3 h-3" />}
              </button>
              <div className="flex-1">
                <p className={`text-sm font-medium ${milestone.status === "COMPLETED" ? "text-gray-400 line-through" : "text-[#1A1A1A]"}`}>
                  {milestone.name}
                </p>
                {milestone.description && <p className="text-xs text-gray-500 mt-0.5">{milestone.description}</p>}
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  milestone.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  milestone.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {milestone.status}
                </span>
                {milestone.date && <p className="text-xs text-gray-400 mt-1">{new Date(milestone.date).toLocaleDateString()}</p>}
              </div>
            </div>
          ))}
          {milestones.length === 0 && (
            <p className="text-center text-gray-400 py-6">No milestones yet. Add one to track progress.</p>
          )}
        </div>
      </div>
    </div>
  );
}
