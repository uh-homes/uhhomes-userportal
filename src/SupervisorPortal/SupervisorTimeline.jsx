import { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineClipboardCheck, HiOutlineCheckCircle } from "react-icons/hi";
import { toast } from "react-toastify";

export default function SupervisorTimeline() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editMilestone, setEditMilestone] = useState(null);
  const [inspectMilestone, setInspectMilestone] = useState(null);
  const [inspectNotes, setInspectNotes] = useState("");
  const [inspectFiles, setInspectFiles] = useState(null);
  const [inspecting, setInspecting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "PLANNED",
    date: "",
    progress: 0,
    order: 1,
  });

  const fetchProjects = async () => {
    try {
      const res = await api.get("/supervisor/projects");
      setProjects(res.data.data);
      if (res.data.data.length > 0 && !selectedProject) {
        setSelectedProject(res.data.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async (projectId) => {
    try {
      const res = await api.get(`/supervisor/timeline/${projectId}`);
      setMilestones(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject?.id) {
      fetchTimeline(selectedProject.id);
    }
  }, [selectedProject?.id]);

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/supervisor/projects/${selectedProject.id}/milestones`, form);
      toast.success("Milestone added!");
      setShowMilestoneForm(false);
      resetForm();
      fetchTimeline(selectedProject.id);
    } catch (err) {
      toast.error("Failed to add milestone");
    }
  };

  const handleUpdateMilestone = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/supervisor/milestones/${editMilestone.id}`, form);
      toast.success("Milestone updated!");
      setEditMilestone(null);
      resetForm();
      fetchTimeline(selectedProject.id);
    } catch (err) {
      toast.error("Failed to update milestone");
    }
  };

  const openEditMilestone = (milestone) => {
    setEditMilestone(milestone);
    setForm({
      name: milestone.name,
      description: milestone.description || "",
      status: milestone.status,
      date: milestone.date?.split("T")[0] || "",
      progress: milestone.progress,
      order: milestone.order,
    });
    setShowMilestoneForm(false);
  };

  const resetForm = () => {
    setForm({ name: "", description: "", status: "PLANNED", date: "", progress: 0, order: 1 });
  };

  const handleInspect = async (e) => {
    e.preventDefault();
    setInspecting(true);
    try {
      const formData = new FormData();
      formData.append("notes", inspectNotes);
      if (inspectFiles) {
        for (let i = 0; i < inspectFiles.length; i++) {
          formData.append("photos", inspectFiles[i]);
        }
      }
      await api.post(`/supervisor/milestones/${inspectMilestone.id}/inspect`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Milestone inspected & approved!");
      setInspectMilestone(null);
      setInspectNotes("");
      setInspectFiles(null);
      fetchTimeline(selectedProject.id);
    } catch (err) {
      toast.error("Inspection failed");
    } finally {
      setInspecting(false);
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
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Construction Timeline</h1>

      {/* Project Selector */}
      <div className="mb-6">
        <select
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          value={selectedProject?.id || ""}
          onChange={(e) => setSelectedProject(projects.find((p) => p.id === parseInt(e.target.value)))}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.user?.fullName || "No Client"}</option>
          ))}
        </select>
      </div>

      {selectedProject && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-[#1A1A1A]">{selectedProject.name}</h2>
              <p className="text-sm text-gray-500">{selectedProject.user?.fullName} • {selectedProject.address}</p>
            </div>
            <button
              onClick={() => { setShowMilestoneForm(true); setEditMilestone(null); resetForm(); }}
              className="bg-[#C5A572] text-white px-3 py-2 rounded-lg hover:bg-[#b39362] flex items-center gap-1 text-sm"
            >
              <HiOutlinePlus /> Add Milestone
            </button>
          </div>

          {/* Milestone Form */}
          {(showMilestoneForm || editMilestone) && (
            <form onSubmit={editMilestone ? handleUpdateMilestone : handleAddMilestone} className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-sm mb-3">{editMilestone ? "Edit Milestone" : "New Milestone"}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Foundation"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="PLANNED">Planned</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETE">Complete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.progress}
                    onChange={(e) => setForm({ ...form, progress: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Order</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="bg-[#C5A572] text-white px-3 py-1.5 rounded-lg text-sm">
                  {editMilestone ? "Update" : "Add"}
                </button>
                <button type="button" onClick={() => { setShowMilestoneForm(false); setEditMilestone(null); resetForm(); }} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Inspection Form */}
          {inspectMilestone && (
            <form onSubmit={handleInspect} className="bg-green-50 rounded-lg p-4 mb-4 border border-green-200">
              <h3 className="font-medium text-sm mb-3 flex items-center gap-2 text-green-800">
                <HiOutlineClipboardCheck /> Inspect & Approve: {inspectMilestone.name}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Inspection Notes *</label>
                  <textarea
                    required
                    rows="3"
                    placeholder="Describe inspection findings, quality checks done..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={inspectNotes}
                    onChange={(e) => setInspectNotes(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Inspection Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                    onChange={(e) => setInspectFiles(e.target.files)}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Upload photos as proof of inspection</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={inspecting} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 disabled:opacity-60">
                  <HiOutlineCheckCircle /> {inspecting ? "Approving..." : "Approve Milestone"}
                </button>
                <button type="button" onClick={() => { setInspectMilestone(null); setInspectNotes(""); setInspectFiles(null); }} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Timeline */}
          <div className="relative ml-4 mt-4">
            {milestones.sort((a, b) => a.order - b.order).map((milestone, idx) => (
              <div key={milestone.id} className="relative pl-8 pb-6 last:pb-0">
                {idx < milestones.length - 1 && (
                  <div className="absolute left-[7px] top-3 w-0.5 h-full bg-gray-200"></div>
                )}
                <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
                  milestone.inspectedAt ? "bg-green-600 border-green-600" :
                  milestone.status === "COMPLETE" ? "bg-green-500 border-green-500" :
                  milestone.status === "IN_PROGRESS" ? "bg-blue-500 border-blue-500" :
                  "bg-white border-gray-300"
                }`}></div>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#1A1A1A]">{milestone.name}</p>
                    {milestone.description && <p className="text-[13px] text-gray-500">{milestone.description}</p>}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        milestone.status === "COMPLETE" ? "bg-green-100 text-green-700" :
                        milestone.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {milestone.status}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {milestone.date ? new Date(milestone.date).toLocaleDateString() : "No date"}
                      </span>
                      <span className="text-[11px] text-gray-400">{milestone.progress}%</span>
                      {milestone.inspectedAt && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-600 text-white flex items-center gap-1">
                          <HiOutlineCheckCircle className="text-xs" /> Approved
                        </span>
                      )}
                    </div>
                    {milestone.inspectedAt && milestone.inspectionNotes && (
                      <p className="text-[11px] text-green-700 mt-1 italic">"{milestone.inspectionNotes}"</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!milestone.inspectedAt && (
                      <button
                        onClick={() => { setInspectMilestone(milestone); setEditMilestone(null); setShowMilestoneForm(false); }}
                        className="p-1.5 text-green-600 hover:text-green-800 rounded"
                        title="Inspect & Approve"
                      >
                        <HiOutlineClipboardCheck className="text-sm" />
                      </button>
                    )}
                    <button onClick={() => openEditMilestone(milestone)} className="p-1.5 text-gray-400 hover:text-[#C5A572] rounded">
                      <HiOutlinePencil className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {milestones.length === 0 && (
              <p className="text-gray-500 text-sm">No milestones for this project yet. Add one above.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
