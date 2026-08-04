import { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlineDocumentDownload, HiOutlineClipboardList } from "react-icons/hi";
import { toast } from "react-toastify";

export default function SupervisorReports() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/supervisor/reports");
        setProjects(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const downloadProjectReport = async (projectId, projectName) => {
    setGenerating(projectId);
    try {
      const res = await api.get(`/admin/reports/project/${projectId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${projectName.replace(/\s+/g, "_")}_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded!");
    } catch (err) {
      toast.error("Failed to generate report");
    } finally {
      setGenerating(null);
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
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">PDF Reports</h1>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-500 shadow-sm border border-gray-100">
          <HiOutlineClipboardList className="text-4xl mx-auto mb-3 text-gray-300" />
          <p>No assigned projects to generate reports for.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => {
            const completedMilestones = project.milestones?.filter((m) => m.status === "COMPLETE").length || 0;
            const totalMilestones = project.milestones?.length || 0;
            return (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#C5A572]/10 flex items-center justify-center">
                    <HiOutlineClipboardList className="w-5 h-5 text-[#C5A572]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{project.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {project.user?.fullName} • {completedMilestones}/{totalMilestones} milestones
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => downloadProjectReport(project.id, project.name)}
                  disabled={generating === project.id}
                  className="flex items-center gap-2 bg-[#C5A572] text-white px-4 py-2 rounded-lg hover:bg-[#b39362] disabled:opacity-60 text-sm transition-colors"
                >
                  {generating === project.id ? (
                    <span className="h-4 w-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <HiOutlineDocumentDownload className="w-4 h-4" />
                  )}
                  Download PDF
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
