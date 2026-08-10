import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlinePencilAlt,
  HiOutlineSearch,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineExclamation,
  HiOutlineDocumentText,
  HiOutlineChat,
} from "react-icons/hi";

export default function ArchitectChangeRequests() {
  const [changeRequests, setChangeRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchChangeRequests();
  }, []);

  const fetchChangeRequests = async () => {
    try {
      const res = await api.get("/architect/change-requests");
      setChangeRequests(res.data.data || []);
    } catch (err) {
      setChangeRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    setUpdating(true);
    try {
      await api.put(`/architect/change-requests/${requestId}`, {
        status: newStatus,
        architectNotes: notes || undefined,
      });
      toast.success(`Change request ${newStatus.replace("_", " ")}`);
      setChangeRequests((prev) =>
        prev.map((r) =>
          r.id === requestId || r._id === requestId
            ? { ...r, status: newStatus, architectNotes: notes }
            : r
        )
      );
      setSelectedRequest(null);
      setNotes("");
    } catch (err) {
      toast.error("Failed to update change request");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "under_review": return "bg-blue-100 text-blue-700";
      case "approved": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      case "implemented": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700";
      case "medium": return "bg-orange-100 text-orange-700";
      case "low": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredRequests = changeRequests.filter((r) => {
    const matchesSearch =
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.requestedBy?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
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
            <HiOutlinePencilAlt className="text-[#C5A572]" />
            Design Change Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage design modification requests</p>
        </div>
        <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {changeRequests.filter((r) => r.status === "pending" || r.status === "under_review").length} active
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search change requests..."
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
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="implemented">Implemented</option>
        </select>
      </div>

      {/* Change Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HiOutlinePencilAlt className="mx-auto text-4xl mb-3" />
          <p className="text-lg font-medium">No change requests</p>
          <p className="text-sm">Design change requests will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div
              key={request.id || request._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-[#1A1A1A]">{request.title}</h3>
                    {request.priority && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{request.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {request.requestedBy && <span>By: {request.requestedBy}</span>}
                    {request.projectName && <span>Project: {request.projectName}</span>}
                    {request.createdAt && <span>{new Date(request.createdAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${getStatusColor(request.status)}`}>
                  {request.status?.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => { setSelectedRequest(null); setNotes(""); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">{selectedRequest.title}</h2>
              <button onClick={() => { setSelectedRequest(null); setNotes(""); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Requested By</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{selectedRequest.requestedBy || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Project</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{selectedRequest.projectName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Priority</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority || "normal"}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status?.replace("_", " ")}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedRequest.description}</p>
              </div>

              {selectedRequest.affectedAreas && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Affected Areas</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedRequest.affectedAreas.map((area, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{area}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Attachments</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.attachments.map((att, i) => (
                      <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100">
                        <HiOutlineDocumentText className="inline mr-1" />
                        {att.name || `File ${i + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Architect Notes & Actions */}
              {selectedRequest.status !== "implemented" && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Architect Notes</p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent resize-none"
                    placeholder="Add technical notes, feasibility comments..."
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedRequest.status === "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedRequest.id || selectedRequest._id, "under_review")}
                        disabled={updating}
                        className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        Start Review
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id || selectedRequest._id, "approved")}
                      disabled={updating}
                      className="px-3 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id || selectedRequest._id, "rejected")}
                      disabled={updating}
                      className="px-3 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                    {selectedRequest.status === "approved" && (
                      <button
                        onClick={() => handleUpdateStatus(selectedRequest.id || selectedRequest._id, "implemented")}
                        disabled={updating}
                        className="px-3 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                      >
                        Mark Implemented
                      </button>
                    )}
                  </div>
                </div>
              )}

              {selectedRequest.architectNotes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Previous Notes</p>
                  <p className="text-sm text-gray-700 bg-green-50 rounded-lg p-3">{selectedRequest.architectNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
