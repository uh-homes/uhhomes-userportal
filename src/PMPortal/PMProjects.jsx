import { useEffect, useState } from "react";
import api from "../Api/api";
import { HiOutlineSearch, HiOutlineEye } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function PMProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/pm/projects");
        setProjects(res.data.data);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-[#1A1A1A]">My Projects</h1>
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No projects assigned yet.</p>
          <p className="text-sm mt-1">Projects will appear here once assigned by admin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const milestones = project.milestones || [];
            const completed = milestones.filter((m) => m.status === "COMPLETED").length;
            const progress = milestones.length > 0 ? Math.round((completed / milestones.length) * 100) : 0;

            return (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base font-semibold text-[#1A1A1A] line-clamp-1">{project.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    project.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                    project.status === "IN_PROGRESS" || project.status === "ACTIVE" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {project.status || "PLANNED"}
                  </span>
                </div>

                {project.user && (
                  <p className="text-sm text-gray-500 mb-3">
                    Buyer: <span className="font-medium text-gray-700">{project.user.fullName}</span>
                  </p>
                )}

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-[#C5A572] h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{milestones.length} milestones</span>
                  <Link
                    to={`/pm/projects/${project.id}`}
                    className="flex items-center gap-1 text-sm text-[#C5A572] hover:text-[#b39362] font-medium"
                  >
                    <HiOutlineEye className="text-base" /> View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
