import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlineTrash, HiOutlinePaperAirplane } from "react-icons/hi";
import { toast } from "react-toastify";

export default function AdminAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "INFO",
    channel: "IN_APP",
    userId: "",
  });

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
      if (!payload.userId) delete payload.userId; // send to all users
      await api.post("/admin/alerts", payload);
      toast.success("Alert sent successfully!");
      setShowCreate(false);
      setForm({ title: "", message: "", type: "INFO", channel: "IN_APP", userId: "" });
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
          Send Alert
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-[#1A1A1A] mb-4">New Alert</h2>
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
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
                <option value="WARNING">Warning</option>
                <option value="ERROR">Error</option>
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

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {alerts.map((alert) => (
            <div key={alert.id} className="px-6 py-4 flex items-start justify-between hover:bg-gray-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${alert.type === "SUCCESS" ? "bg-green-500" : alert.type === "WARNING" ? "bg-yellow-500" : alert.type === "ERROR" ? "bg-red-500" : "bg-blue-500"}`}></span>
                  <span className="font-medium text-[#1A1A1A]">{alert.title}</span>
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
              <button
                onClick={() => handleDelete(alert.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <HiOutlineTrash />
              </button>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className="text-center py-10 text-gray-500">No alerts yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
