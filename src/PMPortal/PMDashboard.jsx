import { useEffect, useState } from "react";
import api from "../Api/api";
import { HiOutlineClipboardList, HiOutlineClock, HiOutlineCheckCircle, HiOutlineChatAlt2 } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function PMDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/pm/dashboard");
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
    { label: "Total Projects", value: stats?.totalProjects || 0, icon: HiOutlineClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Projects", value: stats?.activeProjects || 0, icon: HiOutlineClock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Completed", value: stats?.completedProjects || 0, icon: HiOutlineCheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Pending Inquiries", value: stats?.pendingInquiries || 0, icon: HiOutlineChatAlt2, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Project Manager Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Milestones Overview</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className="bg-[#C5A572] h-3 rounded-full transition-all"
                style={{ width: `${stats?.totalMilestones ? (stats.completedMilestones / stats.totalMilestones) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-500">
              {stats?.completedMilestones || 0}/{stats?.totalMilestones || 0}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/pm/projects" className="bg-blue-50 text-blue-700 text-sm font-medium rounded-lg px-3 py-2.5 text-center hover:bg-blue-100 transition-colors border border-blue-200">
              View Projects
            </Link>
            <Link to="/pm/reports" className="bg-green-50 text-green-700 text-sm font-medium rounded-lg px-3 py-2.5 text-center hover:bg-green-100 transition-colors border border-green-200">
              Reports
            </Link>
            <Link to="/pm/inquiries" className="bg-purple-50 text-purple-700 text-sm font-medium rounded-lg px-3 py-2.5 text-center hover:bg-purple-100 transition-colors border border-purple-200">
              Inquiries
            </Link>
            <Link to="/pm/documents" className="bg-orange-50 text-orange-700 text-sm font-medium rounded-lg px-3 py-2.5 text-center hover:bg-orange-100 transition-colors border border-orange-200">
              Documents
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
