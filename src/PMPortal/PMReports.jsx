import { useEffect, useState } from "react";
import api from "../Api/api";
import { HiOutlineDocumentDownload } from "react-icons/hi";

export default function PMReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/pm/reports");
        setReports(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
        <HiOutlineDocumentDownload className="text-[#C5A572]" /> Project Reports
      </h1>

      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <HiOutlineDocumentDownload className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No project reports available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div key={report.projectId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-[#1A1A1A]">{report.projectName}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  report.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                  report.status === "IN_PROGRESS" || report.status === "ACTIVE" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {report.status || "PLANNED"}
                </span>
              </div>

              {report.buyer && (
                <p className="text-sm text-gray-500 mb-2">Buyer: {report.buyer.fullName}</p>
              )}

              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{report.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#C5A572] h-2 rounded-full transition-all" style={{ width: `${report.progress}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="font-bold text-[#1A1A1A]">{report.totalMilestones}</p>
                  <p className="text-gray-500">Total Milestones</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <p className="font-bold text-green-600">{report.completedMilestones}</p>
                  <p className="text-gray-500">Completed</p>
                </div>
              </div>

              {report.startDate && (
                <p className="text-xs text-gray-400 mt-3">
                  Started: {new Date(report.startDate).toLocaleDateString()}
                  {report.expectedEnd && ` | Expected: ${new Date(report.expectedEnd).toLocaleDateString()}`}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
