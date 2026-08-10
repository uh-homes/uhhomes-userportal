import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import { HiOutlineChatAlt2, HiOutlineReply } from "react-icons/hi";

export default function PMInquiries() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/pm/projects");
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
    if (selectedProject) fetchInquiries();
  }, [selectedProject]);

  const fetchInquiries = async () => {
    try {
      const res = await api.get(`/pm/projects/${selectedProject}/inquiries`);
      setInquiries(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReply = async (inquiryId) => {
    if (!replyText.trim()) return;
    try {
      await api.put(`/pm/inquiries/${inquiryId}/respond`, { reply: replyText });
      toast.success("Reply sent successfully");
      setReplyingTo(null);
      setReplyText("");
      fetchInquiries();
    } catch (err) {
      toast.error("Failed to send reply");
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
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
        <HiOutlineChatAlt2 className="text-[#C5A572]" /> Buyer Inquiries
      </h1>

      {projects.length > 0 && (
        <div className="mb-4">
          <select
            value={selectedProject || ""}
            onChange={(e) => setSelectedProject(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-4">
        {inquiries.map((q) => (
          <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[#1A1A1A]">{q.question || q.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  From: {q.user?.fullName || "Buyer"} &bull; {new Date(q.createdAt).toLocaleDateString()}
                </p>
              </div>
              {!q.reply && (
                <button
                  onClick={() => { setReplyingTo(q.id); setReplyText(""); }}
                  className="flex items-center gap-1 text-sm text-[#C5A572] hover:text-[#b39362]"
                >
                  <HiOutlineReply /> Reply
                </button>
              )}
            </div>

            {q.reply && (
              <div className="mt-3 pl-4 border-l-2 border-[#C5A572]">
                <p className="text-sm text-gray-700">{q.reply}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Replied {q.repliedAt ? new Date(q.repliedAt).toLocaleDateString() : ""}
                </p>
              </div>
            )}

            {replyingTo === q.id && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
                  onKeyDown={(e) => e.key === "Enter" && handleReply(q.id)}
                />
                <button
                  onClick={() => handleReply(q.id)}
                  className="px-4 py-2 bg-[#C5A572] text-white text-sm rounded-lg hover:bg-[#b39362]"
                >
                  Send
                </button>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}

        {inquiries.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <HiOutlineChatAlt2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No inquiries for this project yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
