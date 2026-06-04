import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlineUsers, HiOutlineClipboardList, HiOutlineBell, HiOutlineHome } from "react-icons/hi";

export default function AdminDashboard() {
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
    { label: "Unread Alerts", value: stats?.unreadAlerts || 0, icon: <HiOutlineBell className="text-2xl" />, color: "bg-red-50 text-red-600" },
    { label: "Properties", value: stats?.totalProperties || 0, icon: <HiOutlineHome className="text-2xl" />, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-bold text-[#1A1A1A]">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">New Users (30 days)</p>
          <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{stats?.newUsersThisMonth || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Avg. Completion</p>
          <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{stats?.avgCompletion || 0}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-[#C5A572] h-2 rounded-full" style={{ width: `${stats?.avgCompletion || 0}%` }}></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Total Favorites</p>
          <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{stats?.totalFavorites || 0}</p>
        </div>
      </div>

      {/* Quick Summary */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xl font-bold text-[#C5A572]">{stats?.totalProjects || 0}</p>
            <p className="text-xs text-gray-500">Total Projects</p>
          </div>
          <div>
            <p className="text-xl font-bold text-green-600">{stats?.completedProjects || 0}</p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div>
            <p className="text-xl font-bold text-blue-600">{stats?.activeProjects || 0}</p>
            <p className="text-xs text-gray-500">In Progress</p>
          </div>
          <div>
            <p className="text-xl font-bold text-orange-600">{stats?.totalAlerts || 0}</p>
            <p className="text-xs text-gray-500">Total Alerts</p>
          </div>
        </div>
      </div>
    </div>
  );
}
