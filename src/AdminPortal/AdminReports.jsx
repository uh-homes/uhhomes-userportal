import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlineDocumentDownload, HiOutlineClipboardList } from "react-icons/hi";
import { toast } from "react-toastify";

export default function AdminReports() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/admin/projects");
        setProjects(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
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

  const downloadSummaryReport = async () => {
    setGenerating("summary");
    try {
      const res = await api.get("/admin/reports/summary", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `UHHomes_Summary_Report_${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Summary report downloaded!");
    } catch (err) {
      toast.error("Failed to generate summary report");
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

      {/* Summary Report Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <HiOutlineClipboardList className="text-2xl text-purple-600" />
            </div>
            <div>
              <h2 className="font-semibold text-[#1A1A1A]">All Projects Summary Report</h2>
              <p className="text-sm text-gray-500">Complete overview of all projects, statuses, and milestones</p>
            </div>
          </div>
          <button
            onClick={downloadSummaryReport}
            disabled={generating === "summary"}
            className="bg-[#C5A572] text-white px-4 py-2 rounded-lg hover:bg-[#b39362] flex items-center gap-2 disabled:opacity-50"
          >
            {generating === "summary" ? (
              <span className="block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <HiOutlineDocumentDownload className="text-lg" />
            )}
            Download PDF
          </button>
        </div>
      </div>

      {/* Individual Project Reports */}
      <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Individual Project Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-[#1A1A1A]">{project.name}</h3>
                <p className="text-sm text-gray-500">{project.user?.fullName}</p>
                <p className="text-xs text-gray-400">{project.address}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                project.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                project.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {project.status?.replace("_", " ")}
              </span>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{project.completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-[#C5A572] h-2 rounded-full" style={{ width: `${project.completionPercentage}%` }}></div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {project.milestones?.length || 0} milestones
              </span>
              <button
                onClick={() => downloadProjectReport(project.id, project.name)}
                disabled={generating === project.id}
                className="text-[#C5A572] hover:text-[#b39362] text-sm font-medium flex items-center gap-1 disabled:opacity-50"
              >
                {generating === project.id ? (
                  <span className="block h-3 w-3 border-2 border-[#C5A572] border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <HiOutlineDocumentDownload />
                )}
                Download Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-10 text-gray-500">No projects to generate reports for.</div>
      )}
    </div>
  );
}
