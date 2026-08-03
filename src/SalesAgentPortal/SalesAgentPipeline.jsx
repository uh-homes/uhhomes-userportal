import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import { HiOutlineTrendingUp } from "react-icons/hi";

const STAGES = [
  { key: "NEW", label: "New", color: "border-blue-400", bg: "bg-blue-50", dot: "bg-blue-400" },
  { key: "CONTACTED", label: "Contacted", color: "border-yellow-400", bg: "bg-yellow-50", dot: "bg-yellow-400" },
  { key: "QUALIFIED", label: "Qualified", color: "border-purple-400", bg: "bg-purple-50", dot: "bg-purple-400" },
  { key: "TOUR_SCHEDULED", label: "Tour Scheduled", color: "border-indigo-400", bg: "bg-indigo-50", dot: "bg-indigo-400" },
  { key: "NEGOTIATING", label: "Negotiating", color: "border-orange-400", bg: "bg-orange-50", dot: "bg-orange-400" },
  { key: "CONVERTED", label: "Converted", color: "border-green-400", bg: "bg-green-50", dot: "bg-green-400" },
  { key: "LOST", label: "Lost", color: "border-red-400", bg: "bg-red-50", dot: "bg-red-400" },
];

export default function SalesAgentPipeline() {
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const res = await api.get("/sales/pipeline");
        setPipeline(res.data.data);
      } catch (err) {
        toast.error("Failed to load pipeline");
      } finally {
        setLoading(false);
      }
    };
    fetchPipeline();
  }, []);

  const handleMoveStage = async (leadId, newStatus) => {
    try {
      await api.put(`/sales/leads/${leadId}`, { status: newStatus });
      // Refetch pipeline
      const res = await api.get("/sales/pipeline");
      setPipeline(res.data.data);
      toast.success("Lead moved!");
    } catch (err) {
      toast.error("Failed to move lead.");
    }
  };

  const totalLeads = STAGES.reduce((sum, s) => sum + (pipeline[s.key]?.length || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Sales Pipeline</h1>
          <p className="text-sm text-gray-500 mt-1">{totalLeads} total leads across {STAGES.length} stages</p>
        </div>
      </div>

      {/* Pipeline Summary Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
        <div className="flex items-center gap-1 h-8 rounded-full overflow-hidden bg-gray-100">
          {STAGES.filter((s) => s.key !== "LOST").map((stage) => {
            const count = pipeline[stage.key]?.length || 0;
            const pct = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={stage.key}
                className={`h-full ${stage.dot} flex items-center justify-center text-white text-xs font-medium transition-all`}
                style={{ width: `${pct}%`, minWidth: count > 0 ? "32px" : "0" }}
                title={`${stage.label}: ${count}`}
              >
                {count}
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-3">
          {STAGES.map((stage) => (
            <div key={stage.key} className="flex items-center gap-1.5 text-xs text-gray-500">
              <div className={`w-2.5 h-2.5 rounded-full ${stage.dot}`}></div>
              <span>{stage.label} ({pipeline[stage.key]?.length || 0})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {STAGES.map((stage) => (
          <div key={stage.key} className={`rounded-xl border-t-4 ${stage.color} bg-white shadow-sm border border-gray-100 flex flex-col`}>
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#1A1A1A] text-sm">{stage.label}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stage.bg} ${stage.dot.replace("bg-", "text-")}`}>
                  {pipeline[stage.key]?.length || 0}
                </span>
              </div>
            </div>

            <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[400px]">
              {pipeline[stage.key]?.length > 0 ? (
                pipeline[stage.key].map((lead) => (
                  <div key={lead.id} className={`rounded-lg border border-gray-100 p-3 ${stage.bg} hover:shadow-sm transition-all`}>
                    <p className="text-sm font-medium text-[#1A1A1A]">{lead.name}</p>
                    {lead.property && (
                      <p className="text-xs text-gray-500 mt-1">{lead.property.name}</p>
                    )}
                    {lead.property?.price && (
                      <p className="text-xs font-medium text-[#C5A572] mt-1">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(lead.property.price)}
                      </p>
                    )}
                    {lead.tours?.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {lead.tours.length} tour(s) • Next: {lead.tours.find((t) => t.status === "SCHEDULED")?.scheduledDate || "—"}
                      </p>
                    )}

                    {/* Move buttons */}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {STAGES.filter((s) => s.key !== stage.key).map((s) => (
                        <button
                          key={s.key}
                          onClick={() => handleMoveStage(lead.id, s.key)}
                          className="text-[10px] px-1.5 py-0.5 rounded border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors"
                          title={`Move to ${s.label}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No leads</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
