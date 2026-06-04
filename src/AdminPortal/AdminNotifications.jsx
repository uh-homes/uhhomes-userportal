import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlinePaperAirplane, HiOutlineBell, HiOutlineMailOpen } from "react-icons/hi";
import { toast } from "react-toastify";

export default function AdminNotifications() {
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState({ alerts: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "INFO",
    recipients: "all",
    selectedUsers: [],
    sendEmail: false,
  });

  const fetchData = async () => {
    try {
      const [usersRes, historyRes] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/notifications/history"),
      ]);
      setUsers(usersRes.data.data);
      setHistory(historyRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
        sendEmail: form.sendEmail,
      };

      if (form.recipients !== "all") {
        payload.recipients = form.selectedUsers;
      }

      const res = await api.post("/admin/notifications/push", payload);
      toast.success(`Notification sent to ${res.data.data.recipients} user(s)!`);
      setForm({ title: "", message: "", type: "INFO", recipients: "all", selectedUsers: [], sendEmail: false });
      fetchData();
    } catch (err) {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
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
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Push Notifications</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-[#C5A572]">{history.stats.totalSent || 0}</p>
          <p className="text-xs text-gray-500">Total Sent</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-green-600">{history.stats.read || 0}</p>
          <p className="text-xs text-gray-500">Read</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-red-600">{history.stats.unread || 0}</p>
          <p className="text-xs text-gray-500">Unread</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-2xl font-bold text-blue-600">{history.stats.readRate || 0}%</p>
          <p className="text-xs text-gray-500">Read Rate</p>
        </div>
      </div>

      {/* Send Notification Form */}
      <form onSubmit={handleSend} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
          <HiOutlinePaperAirplane className="text-[#C5A572]" />
          Send New Notification
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Title</label>
            <input
              type="text"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Construction milestone reached!"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Type</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572]"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="INFO">Info</option>
              <option value="SUCCESS">Success</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Urgent</option>
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
            placeholder="Write your notification message here..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Recipients</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#C5A572]"
              value={form.recipients}
              onChange={(e) => setForm({ ...form, recipients: e.target.value })}
            >
              <option value="all">All Users ({users.length})</option>
              <option value="selected">Selected Users</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.sendEmail}
                onChange={(e) => setForm({ ...form, sendEmail: e.target.checked })}
                className="w-4 h-4 text-[#C5A572] rounded focus:ring-[#C5A572]"
              />
              <span className="text-sm text-gray-600">Also send via email</span>
              <HiOutlineMailOpen className="text-gray-400" />
            </label>
          </div>
        </div>

        {form.recipients === "selected" && (
          <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {users.map((u) => (
              <label key={u.id} className="flex items-center gap-2 py-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.selectedUsers.includes(u.id)}
                  onChange={(e) => {
                    const newSelected = e.target.checked
                      ? [...form.selectedUsers, u.id]
                      : form.selectedUsers.filter((id) => id !== u.id);
                    setForm({ ...form, selectedUsers: newSelected });
                  }}
                  className="w-4 h-4 text-[#C5A572] rounded"
                />
                <span className="text-sm">{u.fullName}</span>
                <span className="text-xs text-gray-400">({u.email})</span>
              </label>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={sending}
          className="bg-[#C5A572] text-white px-5 py-2.5 rounded-lg hover:bg-[#b39362] flex items-center gap-2 disabled:opacity-50"
        >
          {sending ? (
            <span className="block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <HiOutlinePaperAirplane />
          )}
          Send Notification
        </button>
      </form>

      {/* Recent History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
            <HiOutlineBell className="text-[#C5A572]" />
            Recent Notifications
          </h2>
        </div>
        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          {history.alerts?.slice(0, 30).map((alert) => (
            <div key={alert.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  alert.type === "SUCCESS" ? "bg-green-500" :
                  alert.type === "WARNING" ? "bg-yellow-500" :
                  alert.type === "ERROR" ? "bg-red-500" : "bg-blue-500"
                }`}></span>
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A]">{alert.title}</p>
                  <p className="text-xs text-gray-500">{alert.user?.fullName} • {new Date(alert.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${alert.read ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                {alert.read ? "Read" : "Unread"}
              </span>
            </div>
          ))}
          {(!history.alerts || history.alerts.length === 0) && (
            <div className="text-center py-8 text-gray-500 text-sm">No notifications sent yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
