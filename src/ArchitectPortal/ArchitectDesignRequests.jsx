import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlineColorSwatch,
  HiOutlineSearch,
  HiOutlineChat,
  HiOutlineCheck,
  HiOutlineClock,
  HiOutlineExclamation,
} from "react-icons/hi";

const STATUS_OPTIONS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "rejected", label: "Rejected" },
];

export default function ArchitectDesignRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [response, setResponse] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/architect/design-requests");
      setRequests(res.data.data || []);
    } catch (err) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    setUpdating(true);
    try {
      await api.put(`/architect/design-requests/${requestId}`, {
        status: newStatus,
        response: response || undefined,
      });
      toast.success(`Request marked as ${newStatus.replace("_", " ")}`);
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId || r._id === requestId ? { ...r, status: newStatus, response } : r))
      );
      setSelectedRequest(null);
      setResponse("");
    } catch (err) {
      toast.error("Failed to update request");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending": return <HiOutlineClock className="text-yellow-500" />;
      case "in_progress": return <HiOutlineExclamation className="text-blue-500" />;
      case "completed": return <HiOutlineCheck className="text-green-500" />;
      case "rejected": return <HiOutlineExclamation className="text-red-500" />;
      default: return <HiOutlineClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      case "rejected": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "customization": return "Customization";
      case "material_selection": return "Material Selection";
      case "layout_change": return "Layout Change";
      case "color_scheme": return "Color Scheme";
      case "fixture_selection": return "Fixture Selection";
      default: return type || "General";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "customization": return "bg-purple-100 text-purple-700";
      case "material_selection": return "bg-orange-100 text-orange-700";
      case "layout_change": return "bg-blue-100 text-blue-700";
      case "color_scheme": return "bg-pink-100 text-pink-700";
      case "fixture_selection": return "bg-teal-100 text-teal-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.buyerName?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.projectName?.toLowerCase().includes(search.toLowerCase());
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
            <HiOutlineColorSwatch className="text-[#C5A572]" />
            Design Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">Handle buyer customization and material selection requests</p>
        </div>
        <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {requests.filter((r) => r.status === "pending").length} pending
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by buyer, project, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setFilterStatus(s.key)}
              className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === s.key
                  ? "bg-[#C5A572] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HiOutlineColorSwatch className="mx-auto text-4xl mb-3" />
          <p className="text-lg font-medium">No design requests</p>
          <p className="text-sm">Buyer requests will appear here when submitted</p>
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
                    {getStatusIcon(request.status)}
                    <h3 className="text-sm font-semibold text-[#1A1A1A]">
                      {request.buyerName || "Unknown Buyer"}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(request.type)}`}>
                      {getTypeLabel(request.type)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{request.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {request.projectName && <span>Project: {request.projectName}</span>}
                    {request.createdAt && <span>{new Date(request.createdAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(request.status)}`}>
                  {request.status?.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => { setSelectedRequest(null); setResponse(""); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Design Request Details</h2>
              <button onClick={() => { setSelectedRequest(null); setResponse(""); }} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Buyer</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{selectedRequest.buyerName || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Project</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{selectedRequest.projectName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(selectedRequest.type)}`}>
                    {getTypeLabel(selectedRequest.type)}
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

              {selectedRequest.materialPreferences && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Material Preferences</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{selectedRequest.materialPreferences}</p>
                </div>
              )}

              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Attachments</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.attachments.map((att, i) => (
                      <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100">
                        {att.name || `Attachment ${i + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Response Section */}
              {selectedRequest.status !== "completed" && selectedRequest.status !== "rejected" && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Your Response</p>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent resize-none"
                    placeholder="Add your response or notes..."
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id || selectedRequest._id, "in_progress")}
                      disabled={updating}
                      className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id || selectedRequest._id, "completed")}
                      disabled={updating}
                      className="flex-1 px-3 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id || selectedRequest._id, "rejected")}
                      disabled={updating}
                      className="px-3 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {selectedRequest.response && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Previous Response</p>
                  <p className="text-sm text-gray-700 bg-green-50 rounded-lg p-3">{selectedRequest.response}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
