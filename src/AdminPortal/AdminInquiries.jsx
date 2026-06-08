import React, { useState, useEffect } from "react";
import api from "../Api/api";
import {
  HiOutlineMail,
  HiOutlineReply,
  HiOutlineTrash,
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineX,
} from "react-icons/hi";
import { toast } from "react-toastify";

export default function AdminInquiries() {
  const [data, setData] = useState({ questions: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [responding, setResponding] = useState(false);

  const fetchInquiries = async () => {
    try {
      const res = await api.get("/admin/inquiries");
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
      toast.error("Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleRespond = async (id) => {
    if (!responseText.trim()) {
      toast.error("Please enter a response message");
      return;
    }

    setResponding(true);
    try {
      await api.put(`/admin/inquiries/${id}/respond`, {
        response: responseText,
      });
      toast.success("Response sent successfully!");
      setResponseText("");
      setSelectedInquiry(null);
      fetchInquiries();
    } catch (err) {
      toast.error("Failed to send response");
    } finally {
      setResponding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      await api.delete(`/admin/inquiries/${id}`);
      toast.success("Inquiry deleted");
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      fetchInquiries();
    } catch (err) {
      toast.error("Failed to delete inquiry");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredQuestions = data.questions.filter((q) => {
    const matchesSearch =
      !searchTerm ||
      q.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || q.status === statusFilter;

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
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">
        Inquiry Messages
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-[#C5A572]">
            {data.stats.total || 0}
          </p>
          <p className="text-xs text-gray-500">Total Inquiries</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-yellow-600">
            {data.stats.pending || 0}
          </p>
          <p className="text-xs text-gray-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-green-600">
            {data.stats.responded || 0}
          </p>
          <p className="text-xs text-gray-500">Responded</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user, subject, or message..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineFilter className="text-gray-400" />
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="RESPONDED">Responded</option>
          </select>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
            <HiOutlineMail className="text-[#C5A572]" />
            User Inquiries ({filteredQuestions.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
          {filteredQuestions.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedInquiry?.id === inquiry.id ? "bg-blue-50" : ""
              }`}
              onClick={() => {
                setSelectedInquiry(inquiry);
                setResponseText(inquiry.response || "");
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        inquiry.status === "RESPONDED"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    ></span>
                    <span className="font-medium text-[#1A1A1A]">
                      {inquiry.subject}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        inquiry.status === "RESPONDED"
                          ? "bg-green-50 text-green-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {inquiry.status === "RESPONDED"
                        ? "Responded"
                        : "Pending"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 ml-4 line-clamp-2">
                    {inquiry.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1 ml-4">
                    <span className="text-xs text-gray-500 font-medium">
                      {inquiry.user?.fullName || "Unknown User"}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">
                      {inquiry.user?.email}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">
                      {formatDate(inquiry.createdAt)}
                    </span>
                    {inquiry.project && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-blue-500">
                          {inquiry.project.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(inquiry.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredQuestions.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">
              No inquiries found.
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
                <HiOutlineMail className="text-[#C5A572]" />
                Inquiry Details
              </h3>
              <button
                onClick={() => {
                  setSelectedInquiry(null);
                  setResponseText("");
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiOutlineX className="text-xl text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C5A572] flex items-center justify-center text-white font-semibold">
                  {selectedInquiry.user?.fullName?.charAt(0).toUpperCase() ||
                    "U"}
                </div>
                <div>
                  <p className="font-medium text-[#1A1A1A]">
                    {selectedInquiry.user?.fullName || "Unknown User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedInquiry.user?.email}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {selectedInquiry.status === "RESPONDED" ? (
                    <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-50 text-green-600">
                      <HiOutlineCheckCircle />
                      Responded
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-yellow-50 text-yellow-600">
                      <HiOutlineClock />
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Subject & Date */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#1A1A1A]">
                    {selectedInquiry.subject}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(selectedInquiry.createdAt)}
                  </span>
                </div>
                {selectedInquiry.project && (
                  <p className="text-xs text-blue-500 mb-2">
                    Project: {selectedInquiry.project.name}
                  </p>
                )}
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {selectedInquiry.message}
                </p>
              </div>

              {/* Existing Response */}
              {selectedInquiry.status === "RESPONDED" &&
                selectedInquiry.response && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <HiOutlineCheckCircle className="text-green-500" />
                      <span className="text-sm font-semibold text-green-800">
                        Your Response
                      </span>
                      {selectedInquiry.respondedAt && (
                        <span className="text-xs text-green-600 ml-auto">
                          {formatDate(selectedInquiry.respondedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-green-800 whitespace-pre-wrap">
                      {selectedInquiry.response}
                    </p>
                  </div>
                )}

              {/* Response Form */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {selectedInquiry.status === "RESPONDED"
                    ? "Update Response"
                    : "Write Response"}
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent text-sm"
                  placeholder="Type your response here..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedInquiry(null);
                  setResponseText("");
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRespond(selectedInquiry.id)}
                disabled={responding || !responseText.trim()}
                className="px-4 py-2 bg-[#C5A572] text-white rounded-lg hover:bg-[#b39362] transition-colors flex items-center gap-2 disabled:opacity-50 text-sm"
              >
                {responding ? (
                  <span className="block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <HiOutlineReply />
                )}
                {selectedInquiry.status === "RESPONDED"
                  ? "Update Response"
                  : "Send Response"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
