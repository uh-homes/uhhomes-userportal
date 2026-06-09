import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlineTrash, HiOutlinePaperAirplane, HiOutlineX } from "react-icons/hi";
import { toast } from "react-toastify";

const CATEGORIES = [
  { key: "ALL", label: "All", color: "text-gray-700", bg: "bg-gray-100", dot: "bg-gray-500" },
  { key: "GENERAL", label: "General", color: "text-blue-700", bg: "bg-blue-50", dot: "bg-blue-500" },
  { key: "FOUNDATION", label: "Foundation", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  { key: "FRAMING", label: "Framing", color: "text-orange-700", bg: "bg-orange-50", dot: "bg-orange-500" },
  { key: "PLUMBING", label: "Plumbing", color: "text-cyan-700", bg: "bg-cyan-50", dot: "bg-cyan-500" },
  { key: "ELECTRICAL", label: "Electrical", color: "text-yellow-700", bg: "bg-yellow-50", dot: "bg-yellow-500" },
  { key: "ROOFING", label: "Roofing", color: "text-indigo-700", bg: "bg-indigo-50", dot: "bg-indigo-500" },
  { key: "INTERIOR", label: "Interior", color: "text-pink-700", bg: "bg-pink-50", dot: "bg-pink-500" },
  { key: "EXTERIOR", label: "Exterior", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
  { key: "INSPECTION", label: "Inspection", color: "text-purple-700", bg: "bg-purple-50", dot: "bg-purple-500" },
  { key: "HANDOVER", label: "Handover", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
];

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "GENERAL",
    channel: "IN_APP",
    userId: "",
  });

  // Send-to-user modal state
  const [sendModal, setSendModal] = useState(null); // holds alert object or null
  const [sendUserId, setSendUserId] = useState("");
  const [sending, setSending] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await api.get("/admin/alerts");
      setAlerts(res.data.data);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchUsers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.userId) delete payload.userId;
      await api.post("/admin/alerts", payload);
      toast.success("Alert sent successfully!");
      setShowCreate(false);
      setForm({ title: "", message: "", type: "GENERAL", channel: "IN_APP", userId: "" });
      fetchAlerts();
    } catch (err) {
      toast.error("Failed to send alert");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    try {
      await api.delete(`/admin/alerts/${id}`);
      toast.success("Alert deleted");
      fetchAlerts();
    } catch (err) {
      toast.error("Failed to delete alert");
    }
  };

  // Send an existing alert to a specific user (or all users)
  const handleSendToUser = async () => {
    if (!sendModal) return;
    setSending(true);
    try {
      const payload = {
        title: sendModal.title,
        message: sendModal.message,
        type: sendModal.type,
        channel: sendModal.channel || "IN_APP",
      };
      if (sendUserId) payload.userId = sendUserId;
      await api.post("/admin/alerts", payload);
      toast.success(sendUserId ? "Alert sent to user!" : "Alert sent to all users!");
      setSendModal(null);
      setSendUserId("");
      fetchAlerts();
    } catch (err) {
      toast.error("Failed to send alert");
    } finally {
      setSending(false);
    }
  };

  // Filter alerts by active category
  const filteredAlerts = activeCategory === "ALL"
    ? alerts
    : alerts.filter((a) => a.type === activeCategory);

  // Count per category
  const getCategoryCount = (key) => {
    if (key === "ALL") return alerts.length;
    return alerts.filter((a) => a.type === key).length;
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Alerts Management</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-[#C5A572] text-white px-4 py-2 rounded-lg hover:bg-[#b39362] transition-colors flex items-center gap-2"
        >
          <HiOutlinePaperAirplane className="text-lg" />
          New Alert
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-[#1A1A1A] mb-4">Create & Send New Alert</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Recipient</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="GENERAL">General</option>
                <option value="FOUNDATION">Foundation</option>
                <option value="FRAMING">Framing</option>
                <option value="PLUMBING">Plumbing</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="ROOFING">Roofing</option>
                <option value="INTERIOR">Interior</option>
                <option value="EXTERIOR">Exterior</option>
                <option value="INSPECTION">Inspection</option>
                <option value="HANDOVER">Handover</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Channel</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
              >
                <option value="IN_APP">In-App</option>
                <option value="EMAIL">Email</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Message</label>
            <textarea
              required
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#C5A572] text-white px-4 py-2 rounded-lg hover:bg-[#b39362]">
              Send
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeCategory === cat.key
                ? `${cat.bg} ${cat.color} ring-1 ring-current`
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${cat.dot}`}></span>
            {cat.label}
            <span className="text-xs opacity-70">({getCategoryCount(cat.key)})</span>
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No {activeCategory !== "ALL" ? activeCategory.toLowerCase() : ""} alerts found.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${CATEGORIES.find((c) => c.key === alert.type)?.dot || "bg-gray-500"}`}></span>
                    <span className="font-medium text-[#1A1A1A]">{alert.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORIES.find((c) => c.key === alert.type)?.bg || "bg-gray-50"} ${CATEGORIES.find((c) => c.key === alert.type)?.color || "text-gray-600"}`}>
                      {CATEGORIES.find((c) => c.key === alert.type)?.label || alert.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${alert.read ? "bg-gray-100 text-gray-500" : "bg-red-50 text-red-600"}`}>
                      {alert.read ? "Read" : "Unread"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 ml-4">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-1 ml-4">
                    <span className="text-xs text-gray-400">{alert.user?.fullName || "Unknown"}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{new Date(alert.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400 capitalize">{alert.channel?.toLowerCase()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setSendModal(alert); setSendUserId(""); }}
                    className="p-2 text-gray-400 hover:text-[#C5A572] hover:bg-[#C5A572]/10 rounded-lg transition-colors"
                    title="Send to user"
                  >
                    <HiOutlinePaperAirplane />
                  </button>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Send to User Modal */}
      {sendModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Send Alert to User</h3>
              <button onClick={() => setSendModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <HiOutlineX className="text-gray-500" />
              </button>
            </div>

            {/* Alert Preview */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${CATEGORIES.find((c) => c.key === sendModal.type)?.dot || "bg-gray-500"}`}></span>
                <span className="font-medium text-sm text-[#1A1A1A]">{sendModal.title}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded ${CATEGORIES.find((c) => c.key === sendModal.type)?.bg || "bg-gray-50"} ${CATEGORIES.find((c) => c.key === sendModal.type)?.color || "text-gray-600"}`}>
                  {CATEGORIES.find((c) => c.key === sendModal.type)?.label || sendModal.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{sendModal.message}</p>
            </div>

            {/* Recipient Select */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-1">Send to</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                value={sendUserId}
                onChange={(e) => setSendUserId(e.target.value)}
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSendToUser}
                disabled={sending}
                className="flex-1 bg-[#C5A572] text-white py-2.5 rounded-lg hover:bg-[#b39362] font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <HiOutlinePaperAirplane />
                {sending ? "Sending..." : "Send Alert"}
              </button>
              <button
                onClick={() => setSendModal(null)}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
