import { useEffect, useState } from "react";
import api from "../Api/api";
import {
  HiOutlineClipboardList,
  HiOutlineClock,
  HiOutlinePhotograph,
  HiOutlinePencilAlt,
  HiOutlineColorSwatch,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { Link } from "react-router-dom";

export default function ArchitectDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/architect/dashboard");
        setStats(res.data.data);
      } catch (err) {
        // Use fallback stats if API not yet available
        setStats({
          assignedProjects: 0,
          pendingDesignRequests: 0,
          pendingChangeRequests: 0,
          uploadedFloorPlans: 0,
          recentUploads: 0,
          milestoneComments: 0,
        });
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
    { label: "Assigned Projects", value: stats?.assignedProjects || 0, icon: HiOutlineClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Design Requests", value: stats?.pendingDesignRequests || 0, icon: HiOutlineColorSwatch, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Change Requests", value: stats?.pendingChangeRequests || 0, icon: HiOutlinePencilAlt, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Floor Plans", value: stats?.uploadedFloorPlans || 0, icon: HiOutlineDocumentText, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Architect Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Manage designs, floorplans, and project assignments</p>

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
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <HiOutlinePhotograph className="text-[#C5A572] text-lg" />
              <span className="text-gray-600">{stats?.recentUploads || 0} uploads this week</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <HiOutlineClock className="text-[#C5A572] text-lg" />
              <span className="text-gray-600">{stats?.milestoneComments || 0} milestone comments</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <HiOutlinePencilAlt className="text-[#C5A572] text-lg" />
              <span className="text-gray-600">{stats?.pendingChangeRequests || 0} pending change requests</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/architect/projects" className="bg-blue-50 text-blue-700 text-sm font-medium rounded-lg px-3 py-2.5 text-center hover:bg-blue-100 transition-colors border border-blue-200">
              View Projects
            </Link>
            <Link to="/architect/floorplans" className="bg-green-50 text-green-700 text-sm font-medium rounded-lg px-3 py-2.5 text-center hover:bg-green-100 transition-colors border border-green-200">
              Manage Floor Plans
            </Link>
            <Link to="/architect/design-requests" className="bg-purple-50 text-purple-700 text-sm font-medium rounded-lg px-3 py-2.5 text-center hover:bg-purple-100 transition-colors border border-purple-200">
              Design Requests
            </Link>
            <Link to="/architect/uploads" className="bg-orange-50 text-orange-700 text-sm font-medium rounded-lg px-3 py-2.5 text-center hover:bg-orange-100 transition-colors border border-orange-200">
              Upload Files
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
