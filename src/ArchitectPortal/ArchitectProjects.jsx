import { useEffect, useState } from "react";
import api from "../Api/api";
import {
  HiOutlineClipboardList,
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlineLocationMarker,
  HiOutlineCalendar,
} from "react-icons/hi";

export default function ArchitectProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/architect/projects");
        setProjects(res.data.data || []);
      } catch (err) {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.location?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "planning": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-gray-100 text-gray-700";
      case "on_hold": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <HiOutlineClipboardList className="text-[#C5A572]" />
            Assigned Projects
          </h1>
          <p className="text-sm text-gray-500 mt-1">View and manage projects assigned to you</p>
        </div>
        <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
          {filteredProjects.length} projects
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="planning">Planning</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <HiOutlineClipboardList className="mx-auto text-4xl mb-3" />
          <p className="text-lg font-medium">No projects assigned yet</p>
          <p className="text-sm">Projects will appear here once assigned by admin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id || project._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-[#1A1A1A] line-clamp-1">{project.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(project.status)}`}>
                  {project.status?.replace("_", " ")}
                </span>
              </div>
              {project.location && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                  <HiOutlineLocationMarker className="text-[#C5A572]" />
                  <span>{project.location}</span>
                </div>
              )}
              {project.startDate && (
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                  <HiOutlineCalendar className="text-[#C5A572]" />
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {project.description && (
                <p className="text-xs text-gray-400 line-clamp-2">{project.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedProject(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-[#1A1A1A]">{selectedProject.name}</h2>
              <button onClick={() => setSelectedProject(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="space-y-3">
              {selectedProject.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiOutlineLocationMarker className="text-[#C5A572]" />
                  <span>{selectedProject.location}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Status:</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status?.replace("_", " ")}
                </span>
              </div>
              {selectedProject.startDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <HiOutlineCalendar className="text-[#C5A572]" />
                  <span>Start: {new Date(selectedProject.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {selectedProject.description && (
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Description</p>
                  <p className="text-sm text-gray-600">{selectedProject.description}</p>
                </div>
              )}
              {selectedProject.milestones && selectedProject.milestones.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-2">Milestones</p>
                  <div className="space-y-2">
                    {selectedProject.milestones.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${m.completed ? "bg-green-500" : "bg-gray-300"}`}></div>
                        <span className={m.completed ? "text-gray-400 line-through" : "text-gray-700"}>{m.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
