import React, { useState, useEffect } from "react";
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaFilter,
  FaSearch,
  FaEnvelope,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCalendarAlt,
  FaTrash,
  FaTrashAlt,
} from "react-icons/fa";
import api from "../../Api/api";

const Alert = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [readFilter, setReadFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();

      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (readFilter !== "ALL")
        params.append("read", readFilter === "UNREAD" ? "false" : "true");
      if (dateFilter !== "ALL") {
        const now = new Date();
        if (dateFilter === "TODAY") {
          params.append("startDate", now.toISOString().split("T")[0]);
        } else if (dateFilter === "WEEK") {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          params.append("startDate", weekAgo.toISOString().split("T")[0]);
        } else if (dateFilter === "MONTH") {
          const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          params.append("startDate", monthAgo.toISOString().split("T")[0]);
        }
      }

      // Corrected API endpoint - use /alerts instead of /user-projects/
      const response = await api.get(`/alerts?${params}`);
      setAlerts(response.data.data.alerts);
      setFilteredAlerts(response.data.data.alerts);
    } catch (err) {
      setError(err.message || "Failed to fetch alerts");
      console.error("Error fetching alerts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      // Corrected API endpoint
      const response = await api.get("/alerts/unread-count");
      setUnreadCount(response.data.data.count);
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchUnreadCount();
  }, [typeFilter, readFilter, dateFilter]);

  // Apply search filter
  useEffect(() => {
    let filtered = alerts;

    if (searchTerm) {
      filtered = filtered.filter(
        (alert) =>
          alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (alert.project?.name &&
            alert.project.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (alert.property?.name &&
            alert.property.name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchTerm]);

  // Mark alert as read
  const markAsRead = async (alertId) => {
    try {
      // Corrected API endpoint
      await api.patch(`/alerts/${alertId}/read`);

      // Update local state
      setAlerts(
        alerts.map((alert) =>
          alert.id === alertId ? { ...alert, read: true } : alert
        )
      );

      // Update unread count
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      window.dispatchEvent(new CustomEvent("alerts-read-update", { detail: { count: newCount } }));
    } catch (err) {
      console.error("Error marking alert as read:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      // Corrected API endpoint
      await api.patch("/alerts/read-all");

      // Update local state
      setAlerts(alerts.map((alert) => ({ ...alert, read: true })));

      // Reset unread count
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent("alerts-read-update", { detail: { count: 0 } }));
    } catch (err) {
      console.error("Error marking all alerts as read:", err);
    }
  };

  // Delete single alert
  const deleteAlert = async (alertId) => {
    try {
      await api.delete(`/alerts/${alertId}`);
      const deleted = alerts.find((a) => a.id === alertId);
      const updated = alerts.filter((a) => a.id !== alertId);
      setAlerts(updated);
      if (deleted && !deleted.read) {
        const newCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newCount);
        window.dispatchEvent(new CustomEvent("alerts-read-update", { detail: { count: newCount } }));
      }
    } catch (err) {
      console.error("Error deleting alert:", err);
    }
  };

  // Delete all alerts
  const deleteAllAlerts = async () => {
    if (!window.confirm("Are you sure you want to delete all alerts?")) return;
    try {
      await api.delete("/alerts/all");
      setAlerts([]);
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent("alerts-read-update", { detail: { count: 0 } }));
    } catch (err) {
      console.error("Error deleting all alerts:", err);
    }
  };

  // Get alert icon based on type
  const getAlertIcon = (type) => {
    switch (type) {
      case "FOUNDATION":
        return <FaInfoCircle className="text-amber-500" />;
      case "FRAMING":
        return <FaInfoCircle className="text-orange-500" />;
      case "PLUMBING":
        return <FaInfoCircle className="text-cyan-500" />;
      case "ELECTRICAL":
        return <FaExclamationTriangle className="text-yellow-500" />;
      case "ROOFING":
        return <FaInfoCircle className="text-indigo-500" />;
      case "INTERIOR":
        return <FaInfoCircle className="text-pink-500" />;
      case "EXTERIOR":
        return <FaInfoCircle className="text-green-500" />;
      case "INSPECTION":
        return <FaExclamationTriangle className="text-purple-500" />;
      case "HANDOVER":
        return <FaCheck className="text-emerald-500" />;
      case "GENERAL":
      default:
        return <FaBell className="text-blue-500" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-gray-900">Alerts</h1>
            {unreadCount > 0 && (
              <span className="bg-[#C5A572] text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#C5A572] border border-[#C5A572] rounded-lg hover:bg-[#C5A572] hover:text-white transition-colors"
              >
                <FaCheckDouble className="text-xs" />
                Mark all read
              </button>
            )}
            {alerts.length > 0 && (
              <button
                onClick={deleteAllAlerts}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 border border-red-300 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
              >
                <FaTrash className="text-xs" />
                Delete all
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search alerts..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#C5A572] focus:border-[#C5A572] outline-none w-52"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#C5A572] focus:border-[#C5A572] outline-none text-gray-600"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
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
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#C5A572] focus:border-[#C5A572] outline-none text-gray-600"
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#C5A572] focus:border-[#C5A572] outline-none text-gray-600"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="WEEK">Past Week</option>
            <option value="MONTH">Past Month</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filteredAlerts.length === 0 ? (
          <div className="py-16 text-center">
            <FaEnvelope className="text-3xl text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">No alerts found</p>
            <p className="text-xs text-gray-400 mt-1">
              {searchTerm ||
              typeFilter !== "ALL" ||
              readFilter !== "ALL" ||
              dateFilter !== "ALL"
                ? "Try adjusting your filters"
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 transition-colors ${
                  !alert.read
                    ? "bg-amber-50/50 border-[#C5A572]/20"
                    : "bg-white border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-sm">{getAlertIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className={`text-sm font-medium leading-snug ${
                        !alert.read ? "text-gray-900" : "text-gray-700"
                      }`}>
                        {alert.title}
                      </p>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatDate(alert.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded capitalize">
                        {alert.type?.toLowerCase() || "alert"}
                      </span>
                      {alert.read && (
                        <span className="text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Read</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {!alert.read && (
                      <button
                        onClick={() => markAsRead(alert.id)}
                        className="p-1.5 text-[#C5A572] hover:bg-[#C5A572]/10 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <FaCheck className="text-xs" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <FaTrashAlt className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
