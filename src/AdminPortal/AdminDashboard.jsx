import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../Api/api";
import { HiOutlineUsers, HiOutlineClipboardList, HiOutlineBell, HiOutlineHome, HiOutlineMail, HiOutlineArrowRight } from "react-icons/hi";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: <HiOutlineUsers className="text-2xl" />, color: "bg-blue-50 text-blue-600" },
    { label: "Active Projects", value: stats?.activeProjects || 0, icon: <HiOutlineClipboardList className="text-2xl" />, color: "bg-green-50 text-green-600" },
    { label: "Pending Inquiries", value: stats?.pendingInquiries || 0, icon: <HiOutlineMail className="text-2xl" />, color: "bg-orange-50 text-orange-600", link: "/admin/inquiries" },
    { label: "Unread Alerts", value: stats?.unreadAlerts || 0, icon: <HiOutlineBell className="text-2xl" />, color: "bg-red-50 text-red-600" },
    { label: "Properties", value: stats?.totalProperties || 0, icon: <HiOutlineHome className="text-2xl" />, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 ${card.link ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
            onClick={() => card.link && navigate(card.link)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
              {card.link && card.value > 0 && (
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
              )}
            </div>
            <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">New Users (30 days)</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{stats?.newUsersThisMonth || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Avg. Completion</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{stats?.avgCompletion || 0}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-[#C5A572] h-2 rounded-full" style={{ width: `${stats?.avgCompletion || 0}%` }}></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Total Favorites</p>
          <p className="text-xl font-semibold text-gray-900 mt-1">{stats?.totalFavorites || 0}</p>
        </div>
      </div>

      {/* Recent Inquiries */}
      {stats?.recentInquiries?.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiOutlineMail className="text-xl text-orange-500" />
              <h2 className="text-sm font-semibold text-gray-900">New Inquiries</h2>
              <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {stats.pendingInquiries} pending
              </span>
            </div>
            <button
              onClick={() => navigate("/admin/inquiries")}
              className="flex items-center gap-1 text-sm text-[#C5A572] font-medium hover:text-[#A8894D] transition-colors"
            >
              View all
              <HiOutlineArrowRight className="text-sm" />
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="flex items-start justify-between py-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                onClick={() => navigate("/admin/inquiries")}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0"></span>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {inquiry.user?.fullName || "Unknown User"}
                    </p>
                    <span className="text-xs text-gray-400">
                      {inquiry.subject}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 ml-4 line-clamp-1">
                    {inquiry.message}
                  </p>
                  {inquiry.project && (
                    <p className="text-xs text-gray-400 mt-0.5 ml-4">
                      Project: {inquiry.project.name}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-3">
                  {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Summary */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-[#C5A572]">{stats?.totalProjects || 0}</p>
            <p className="text-xs text-gray-500">Total Projects</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-green-600">{stats?.completedProjects || 0}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-blue-600">{stats?.activeProjects || 0}</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-orange-600">{stats?.totalAlerts || 0}</p>
            <p className="text-xs text-gray-500">Total Alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
