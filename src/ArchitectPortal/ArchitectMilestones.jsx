import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlineClock,
  HiOutlineSearch,
  HiOutlineChat,
  HiOutlineCheck,
  HiOutlineCalendar,
  HiOutlineClipboardList,
} from "react-icons/hi";

export default function ArchitectMilestones() {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const res = await api.get("/architect/milestones");
      setMilestones(res.data.data || []);
    } catch (err) {
      setMilestones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (milestoneId) => {
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/architect/milestones/${milestoneId}/comments`, {
        text: comment,
      });
      toast.success("Comment added successfully");
      setComment("");
      // Update local state
      setMilestones((prev) =>
        prev.map((m) => {
          if (m.id === milestoneId || m._id === milestoneId) {
            return {
              ...m,
              comments: [...(m.comments || []), { text: comment, createdAt: new Date().toISOString(), author: "You" }],
            };
          }
          return m;
        })
      );
      // Refresh selected milestone
      if (selectedMilestone && (selectedMilestone.id === milestoneId || selectedMilestone._id === milestoneId)) {
        setSelectedMilestone((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), { text: comment, createdAt: new Date().toISOString(), author: "You" }],
        }));
      }
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "upcoming": return "bg-yellow-100 text-yellow-700";
      case "delayed": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredMilestones = milestones.filter((m) => {
    const matchesSearch =
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.projectName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || m.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <HiOutlineClock className="text-[#C5A572]" />
            Milestone Updates
          </h1>
          <p className="text-sm text-gray-500 mt-1">View milestones and add comments on project progress</p>
        </div>
        <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {milestones.length} milestones
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search milestones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      {/* Milestones List */}
      {filteredMilestones.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HiOutlineClock className="mx-auto text-4xl mb-3" />
          <p className="text-lg font-medium">No milestones found</p>
          <p className="text-sm">Project milestones will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMilestones.map((milestone) => (
            <div
              key={milestone.id || milestone._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedMilestone(milestone)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {milestone.status === "completed" ? (
                      <HiOutlineCheck className="text-green-500" />
                    ) : (
                      <HiOutlineClock className="text-[#C5A572]" />
                    )}
                    <h3 className="text-sm font-semibold text-[#1A1A1A]">{milestone.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {milestone.projectName && (
                      <span className="flex items-center gap-1">
                        <HiOutlineClipboardList /> {milestone.projectName}
                      </span>
                    )}
                    {milestone.dueDate && (
                      <span className="flex items-center gap-1">
                        <HiOutlineCalendar /> {new Date(milestone.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {milestone.comments && milestone.comments.length > 0 && (
                      <span className="flex items-center gap-1">
                        <HiOutlineChat /> {milestone.comments.length} comments
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(milestone.status)}`}>
                  {milestone.status?.replace("_", " ")}
                </span>
              </div>
              {milestone.progress !== undefined && (
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#C5A572] h-2 rounded-full transition-all"
                        style={{ width: `${milestone.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{milestone.progress}%</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => { setSelectedMilestone(null); setComment(""); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">{selectedMilestone.title}</h2>
              <button onClick={() => { setSelectedMilestone(null); setComment(""); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Project</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{selectedMilestone.projectName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(selectedMilestone.status)}`}>
                    {selectedMilestone.status?.replace("_", " ")}
                  </span>
                </div>
                {selectedMilestone.dueDate && (
                  <div>
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="text-sm font-medium text-[#1A1A1A]">{new Date(selectedMilestone.dueDate).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedMilestone.progress !== undefined && (
                  <div>
                    <p className="text-xs text-gray-500">Progress</p>
                    <p className="text-sm font-medium text-[#1A1A1A]">{selectedMilestone.progress}%</p>
                  </div>
                )}
              </div>

              {selectedMilestone.description && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedMilestone.description}</p>
                </div>
              )}

              {/* Comments Section */}
              <div>
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <HiOutlineChat /> Comments ({selectedMilestone.comments?.length || 0})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                  {selectedMilestone.comments && selectedMilestone.comments.length > 0 ? (
                    selectedMilestone.comments.map((c, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-[#1A1A1A]">{c.author || "Unknown"}</span>
                          <span className="text-xs text-gray-400">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{c.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-4">No comments yet</p>
                  )}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={2}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent resize-none"
                    placeholder="Add a comment on this milestone..."
                  />
                  <button
                    onClick={() => handleAddComment(selectedMilestone.id || selectedMilestone._id)}
                    disabled={submitting || !comment.trim()}
                    className="px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                  >
                    {submitting ? "..." : "Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
