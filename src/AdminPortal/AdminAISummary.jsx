import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlineSparkles, HiOutlineMailOpen, HiOutlineRefresh } from "react-icons/hi";
import { toast } from "react-toastify";

export default function AdminAISummary() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/admin/projects");
        setProjects(res.data.data);
        if (res.data.data.length > 0) setSelectedProject(res.data.data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleGenerate = async () => {
    if (!selectedProject) return;
    setGenerating(true);
    setSummary(null);
    try {
      const res = await api.post(`/admin/ai-summary/generate/${selectedProject.id}`);
      setSummary(res.data.data);
      toast.success("Summary generated!");
    } catch (err) {
      toast.error("Failed to generate summary");
    } finally {
      setGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!selectedProject) return;
    setSending(true);
    try {
      const res = await api.post(`/admin/ai-summary/send/${selectedProject.id}`);
      toast.success(res.data.message || "Summary sent via email!");
    } catch (err) {
      toast.error("Failed to send summary");
    } finally {
      setSending(false);
    }
  };

  const handleSendAll = async () => {
    if (!window.confirm("Send weekly summaries to all active project homeowners?")) return;
    setSendingAll(true);
    try {
      const res = await api.post("/admin/ai-summary/send-all");
      toast.success(`Sent to ${res.data.data.sent} homeowner(s)!`);
    } catch (err) {
      toast.error("Failed to send summaries");
    } finally {
      setSendingAll(false);
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
          <HiOutlineSparkles className="text-[#C5A572]" />
          AI Weekly Summary
        </h1>
        <button
          onClick={handleSendAll}
          disabled={sendingAll}
          className="bg-[#C5A572] text-white px-4 py-2 rounded-lg hover:bg-[#b39362] flex items-center gap-2 disabled:opacity-50"
        >
          {sendingAll ? (
            <span className="block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <HiOutlineMailOpen />
          )}
          Send All Weekly Summaries
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-[#C5A572]/10 to-[#D4AF37]/10 rounded-xl p-5 mb-6 border border-[#C5A572]/20">
        <div className="flex items-start gap-3">
          <HiOutlineSparkles className="text-xl text-[#C5A572] mt-0.5" />
          <div>
            <h3 className="font-semibold text-[#1A1A1A]">How it works</h3>
            <p className="text-sm text-gray-600 mt-1">
              AI generates a professional weekly progress summary from your project's milestones and updates.
              If an OpenAI API key is configured (<code className="bg-white px-1 rounded text-xs">OPENAI_API_KEY</code> in .env),
              it uses GPT-4o-mini for natural language. Otherwise, a structured rule-based summary is generated.
            </p>
          </div>
        </div>
      </div>

      {/* Project Selector + Generate */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-[#1A1A1A] mb-4">Generate Summary for Project</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#C5A572]"
            value={selectedProject?.id || ""}
            onChange={(e) => {
              setSelectedProject(projects.find((p) => p.id === parseInt(e.target.value)));
              setSummary(null);
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.user?.fullName} ({p.completionPercentage}%)
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-[#3A3A3A] flex items-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <span className="block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <HiOutlineRefresh />
              )}
              Generate
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="bg-[#C5A572] text-white px-4 py-2 rounded-lg hover:bg-[#b39362] flex items-center gap-2 disabled:opacity-50"
            >
              {sending ? (
                <span className="block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <HiOutlineMailOpen />
              )}
              Generate & Send Email
            </button>
          </div>
        </div>
      </div>

      {/* Generated Summary Preview */}
      {summary && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#1A1A1A]">Generated Summary Preview</h3>
              <p className="text-xs text-gray-500">
                {summary.projectName} • {summary.homeowner} • Generated with: {summary.generatedWith}
              </p>
            </div>
            <span className="text-xs text-gray-400">{new Date(summary.generatedAt).toLocaleString()}</span>
          </div>
          <div className="p-5">
            <div className="bg-gray-50 rounded-lg p-5 prose prose-sm max-w-none">
              {summary.summary.split("\n").map((line, i) => {
                if (line.startsWith("## ")) {
                  return <h2 key={i} className="text-lg font-bold text-[#1A1A1A] mt-4 mb-2">{line.replace("## ", "")}</h2>;
                }
                if (line.startsWith("### ")) {
                  return <h3 key={i} className="text-base font-semibold text-[#1A1A1A] mt-3 mb-1">{line.replace("### ", "")}</h3>;
                }
                if (line.startsWith("- ")) {
                  const content = line.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                  return <li key={i} className="text-sm text-gray-700 ml-4" dangerouslySetInnerHTML={{ __html: content }} />;
                }
                if (line.startsWith("**")) {
                  const content = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
                  return <p key={i} className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: content }} />;
                }
                if (line.trim() === "") return <br key={i} />;
                return <p key={i} className="text-sm text-gray-700">{line}</p>;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Project Cards */}
      {!summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.filter((p) => p.status === "IN_PROGRESS").map((project) => (
            <div key={project.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#C5A572]/10 rounded-lg flex items-center justify-center">
                  <HiOutlineSparkles className="text-[#C5A572]" />
                </div>
                <div>
                  <p className="font-medium text-sm text-[#1A1A1A]">{project.name}</p>
                  <p className="text-xs text-gray-500">{project.user?.fullName}</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                <div className="bg-[#C5A572] h-1.5 rounded-full" style={{ width: `${project.completionPercentage}%` }}></div>
              </div>
              <p className="text-xs text-gray-400">{project.completionPercentage}% complete • {project.milestones?.length || 0} milestones</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
