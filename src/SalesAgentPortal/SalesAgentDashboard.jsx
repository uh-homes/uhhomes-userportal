import { useEffect, useState } from "react";
import api from "../Api/api";
import { HiOutlineUserAdd, HiOutlineHome, HiOutlineCalendar, HiOutlineUsers, HiOutlineTrendingUp, HiOutlineCheckCircle } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function SalesAgentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/sales/dashboard");
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
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

  const cards = [
    { label: "Total Leads", value: stats?.totalLeads || 0, icon: HiOutlineUserAdd, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "New Leads", value: stats?.newLeads || 0, icon: HiOutlineTrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Upcoming Tours", value: stats?.upcomingTours || 0, icon: HiOutlineCalendar, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Properties", value: stats?.totalProperties || 0, icon: HiOutlineHome, color: "text-teal-600", bg: "bg-teal-50" },
    { label: "Converted", value: stats?.convertedLeads || 0, icon: HiOutlineCheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Assigned Buyers", value: stats?.assignedBuyers || 0, icon: HiOutlineUsers, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Sales Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#1A1A1A]">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Conversion Rate & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Conversion Rate</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className="bg-[#C5A572] h-3 rounded-full transition-all"
                style={{ width: `${stats?.conversionRate || 0}%` }}
              ></div>
            </div>
            <span className="text-lg font-bold text-[#C5A572]">{stats?.conversionRate || 0}%</span>
          </div>
          <div className="mt-3 flex gap-4 text-sm text-gray-500">
            <span>Converted: {stats?.convertedLeads || 0}</span>
            <span>Lost: {stats?.lostLeads || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/sales/leads" className="bg-blue-50 text-blue-700 text-sm font-medium rounded-lg px-3 py-2.5 text-center hover:bg-blue-100 transition-colors border border-blue-200">
              Manage Leads
            </Link>
            <Link to="/sales/tours" className="bg-purple-50 text-purple-700 text-sm font-medium rounded-lg px-3 py-2.5 text-center hover:bg-purple-100 transition-colors border border-purple-200">
              Schedule Tour
            </Link>
            <Link to="/sales/properties" className="bg-teal-50 text-teal-700 text-sm font-medium rounded-lg px-3 py-2.5 text-center hover:bg-teal-100 transition-colors border border-teal-200">
              Browse Properties
            </Link>
            <Link to="/sales/pipeline" className="bg-orange-50 text-orange-700 text-sm font-medium rounded-lg px-3 py-2.5 text-center hover:bg-orange-100 transition-colors border border-orange-200">
              View Pipeline
            </Link>
          </div>
        </div>
      </div>

      {/* Today's Tours & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Today's Tours</h3>
          {stats?.todaysTours?.length > 0 ? (
            <div className="space-y-3">
              {stats.todaysTours.map((tour) => (
                <div key={tour.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">{tour.lead?.name}</p>
                    <p className="text-xs text-gray-500">{tour.property?.name} • {tour.property?.location}</p>
                  </div>
                  <span className="text-sm font-medium text-[#C5A572]">{tour.scheduledTime}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No tours scheduled for today.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Recent Leads</h3>
          {stats?.recentLeads?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentLeads.map((lead) => (
                <div key={lead.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.property?.name || "No property"} • {lead.source}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    lead.status === "NEW" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    lead.status === "CONVERTED" ? "bg-green-50 text-green-700 border-green-200" :
                    "bg-gray-100 text-gray-600 border-gray-200"
                  }`}>
                    {lead.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No leads yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
