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
        const today = new Date();
        if (dateFilter === "TODAY") {
          params.append("startDate", today.toISOString().split("T")[0]);
        } else if (dateFilter === "WEEK") {
          const weekAgo = new Date(today.setDate(today.getDate() - 7));
          params.append("startDate", weekAgo.toISOString().split("T")[0]);
        } else if (dateFilter === "MONTH") {
          const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
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
      setUnreadCount((prev) => Math.max(0, prev - 1));
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
    } catch (err) {
      console.error("Error marking all alerts as read:", err);
    }
  };

  // Get alert icon based on type
  const getAlertIcon = (type) => {
    switch (type) {
      case "URGENT":
        return <FaExclamationTriangle className="text-red-500" />;
      case "INFO":
        return <FaInfoCircle className="text-blue-500" />;
      case "UPDATE":
        return <FaBell className="text-yellow-500" />;
      default:
        return <FaEnvelope className="text-gray-500" />;
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
    <div className="bg-white rounded-lg shadow-lg min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <FaBell className="text-2xl text-blue-600 mr-3" />
            <h1 className="text-2xl  text-gray-800">Alerts & Notifications</h1>
            {unreadCount > 0 && (
              <span className="ml-3 bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaCheckDouble className="mr-2" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          {/* <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="URGENT">Urgent</option>
            <option value="INFO">Information</option>
            <option value="UPDATE">Updates</option>
          </select> */}


          {/* Read Status Filter */}
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
          </select>

          {/* Date Filter */}
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      <div className="flex-1 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FaEnvelope className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-lg">No alerts found</p>
            <p className="text-sm mt-2">
              {searchTerm ||
              typeFilter !== "ALL" ||
              readFilter !== "ALL" ||
              dateFilter !== "ALL"
                ? "Try adjusting your filters"
                : "You're all caught up! No new alerts."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !alert.read ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="mt-1">{getAlertIcon(alert.type)}</div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-opensans ${
                            !alert.read ? "text-blue-800" : "text-gray-800"
                          }`}
                        >
                          {alert.title}
                        </h3>
                        <span className="text-xs text-gray-500 flex items-center">
                          <FaCalendarAlt className="mr-1" />
                          {formatDate(alert.createdAt)}
                        </span>
                      </div>

                      <p className="text-gray-800 mt-2">{alert.message}</p>

                      {/* Project/Property context */}
                      {(alert.project || alert.property) && (
                        <div className="mt-3 p-3 bg-gray-100 rounded-lg">
                          <p className="text-sm text-gray-800">
                            {alert.project &&
                              `Project: ${alert.project.property.name}`}
                            {alert.property &&
                              `Property: ${alert.property.name}`}
                            {alert.property?.community &&
                              ` • Community: ${alert.property.community.title}`}
                          </p>
                        </div>
                      )}

                      {/* Alert metadata */}
                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <span className="capitalize">
                          {alert.type.toLowerCase()}
                        </span>
                        <span>•</span>
                        <span className="capitalize">
                          {alert.channel.toLowerCase()}
                        </span>
                        {alert.read && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">Read</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {!alert.read && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="ml-4 p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                      title="Mark as read"
                    >
                      <FaCheck />
                    </button>
                  )}
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
