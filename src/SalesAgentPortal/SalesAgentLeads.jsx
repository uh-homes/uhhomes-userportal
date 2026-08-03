import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineX,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineFilter,
} from "react-icons/hi";

const STATUS_OPTIONS = ["NEW", "CONTACTED", "QUALIFIED", "TOUR_SCHEDULED", "NEGOTIATING", "CONVERTED", "LOST"];
const SOURCE_OPTIONS = ["WEBSITE", "REFERRAL", "WALK_IN", "SOCIAL_MEDIA", "PHONE", "OTHER"];

const STATUS_COLORS = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  CONTACTED: "bg-yellow-50 text-yellow-700 border-yellow-200",
  QUALIFIED: "bg-purple-50 text-purple-700 border-purple-200",
  TOUR_SCHEDULED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  NEGOTIATING: "bg-orange-50 text-orange-700 border-orange-200",
  CONVERTED: "bg-green-50 text-green-700 border-green-200",
  LOST: "bg-red-50 text-red-700 border-red-200",
};

export default function SalesAgentLeads() {
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", propertyId: "", source: "OTHER", notes: "" });
  const [saving, setSaving] = useState(false);

  const fetchLeads = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await api.get("/sales/leads", { params });
      setLeads(res.data.data);
    } catch (err) {
      toast.error("Failed to load leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await api.get("/sales/properties");
      setProperties(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchProperties();
  }, [filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error("Lead name is required.");
    setSaving(true);
    try {
      if (editingLead) {
        await api.put(`/sales/leads/${editingLead.id}`, form);
        toast.success("Lead updated!");
      } else {
        await api.post("/sales/leads", form);
        toast.success("Lead created!");
      }
      setShowForm(false);
      setEditingLead(null);
      setForm({ name: "", email: "", phone: "", propertyId: "", source: "OTHER", notes: "" });
      await fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save lead");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      propertyId: lead.propertyId || "",
      source: lead.source || "OTHER",
      notes: lead.notes || "",
      status: lead.status || "NEW",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await api.delete(`/sales/leads/${id}`);
      toast.success("Lead deleted.");
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      toast.error("Failed to delete lead.");
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await api.put(`/sales/leads/${leadId}`, { status: newStatus });
      setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
      toast.success("Status updated!");
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const filtered = leads.filter(
    (l) =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search)
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Prospect Leads</h1>
        <button
          onClick={() => { setShowForm(true); setEditingLead(null); setForm({ name: "", email: "", phone: "", propertyId: "", source: "OTHER", notes: "" }); }}
          className="flex items-center gap-2 bg-[#C5A572] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#b39362] transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          />
        </div>
        <div className="relative">
          <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent appearance-none bg-white"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace("_", " ")}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lead Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">{editingLead ? "Edit Lead" : "New Lead"}</h2>
              <button onClick={() => { setShowForm(false); setEditingLead(null); }} className="text-gray-400 hover:text-gray-600">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property</label>
                  <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent">
                    <option value="">Select property...</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent">
                    {SOURCE_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
              {editingLead && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent">
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#C5A572] text-white font-medium py-2.5 rounded-lg hover:bg-[#b39362] disabled:opacity-60 transition-colors">
                  {saving ? "Saving..." : editingLead ? "Update Lead" : "Create Lead"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingLead(null); }} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leads List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <p className="text-gray-500">No leads found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((lead) => (
            <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-[#C5A572]/30 transition-all">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[#1A1A1A] font-semibold">{lead.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                      {lead.status?.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">{lead.source?.replace("_", " ")}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    {lead.email && <span>{lead.email}</span>}
                    {lead.phone && <span>{lead.phone}</span>}
                    {lead.property && <span className="text-[#C5A572]">{lead.property.name}</span>}
                  </div>
                  {lead.notes && <p className="text-sm text-gray-400 mt-2">{lead.notes}</p>}
                  <p className="text-xs text-gray-400 mt-2">Added: {new Date(lead.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.replace("_", " ")}</option>
                    ))}
                  </select>
                  <button onClick={() => handleEdit(lead)} className="p-2 text-gray-400 hover:text-[#C5A572] transition-colors">
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(lead.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
