import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";

export default function SupervisorInquiries() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [respondingId, setRespondingId] = useState(null);
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/supervisor/projects");
        setProjects(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedProject(res.data.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    const fetchInquiries = async () => {
      try {
        const res = await api.get(`/supervisor/projects/${selectedProject}/inquiries`);
        setInquiries(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInquiries();
  }, [selectedProject]);

  const handleRespond = async (inquiryId) => {
    if (!answer.trim()) return;
    try {
      await api.put(`/supervisor/inquiries/${inquiryId}/respond`, { answer });
      setInquiries((prev) =>
        prev.map((q) => (q.id === inquiryId ? { ...q, answer, status: "ANSWERED" } : q))
      );
      setRespondingId(null);
      setAnswer("");
      toast.success("Response sent!");
    } catch (err) {
      toast.error("Failed to respond.");
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
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Buyer Inquiries</h1>

      <div className="mb-4">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <p className="text-gray-500">No inquiries for this project.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inquiries.map((q) => (
            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[#1A1A1A] font-medium">{q.question || q.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    From: {q.user?.fullName || "Unknown"} • {new Date(q.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  q.status === "ANSWERED" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}>
                  {q.status}
                </span>
              </div>

              {q.answer && (
                <div className="mt-3 pl-4 border-l-2 border-[#C5A572]">
                  <p className="text-gray-600 text-sm">{q.answer}</p>
                </div>
              )}

              {q.status !== "ANSWERED" && (
                <>
                  {respondingId === q.id ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        rows={3}
                        placeholder="Type your response..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(q.id)}
                          className="bg-[#C5A572] text-white text-sm px-4 py-1.5 rounded-lg hover:bg-[#b39362] transition-colors"
                        >
                          Send
                        </button>
                        <button
                          onClick={() => { setRespondingId(null); setAnswer(""); }}
                          className="text-gray-500 text-sm px-4 py-1.5 rounded-lg hover:text-[#1A1A1A] transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingId(q.id)}
                      className="mt-3 text-sm text-[#C5A572] hover:text-[#b39362] font-medium transition-colors"
                    >
                      Respond
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
