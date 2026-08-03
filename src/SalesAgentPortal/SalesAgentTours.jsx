import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineCalendar,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineFilter,
} from "react-icons/hi";

const TOUR_STATUS_COLORS = {
  SCHEDULED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  NO_SHOW: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function SalesAgentTours() {
  const [tours, setTours] = useState([]);
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [form, setForm] = useState({ leadId: "", propertyId: "", scheduledDate: "", scheduledTime: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const fetchTours = async () => {
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const res = await api.get("/sales/tours", { params });
      setTours(res.data.data);
    } catch (err) {
      toast.error("Failed to load tours");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadsAndProperties = async () => {
    try {
      const [leadsRes, propsRes] = await Promise.all([
        api.get("/sales/leads"),
        api.get("/sales/properties"),
      ]);
      setLeads(leadsRes.data.data);
      setProperties(propsRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTours();
    fetchLeadsAndProperties();
  }, [filterStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.leadId || !form.propertyId || !form.scheduledDate || !form.scheduledTime) {
      return toast.error("Lead, property, date, and time are required.");
    }
    setSaving(true);
    try {
      if (editingTour) {
        await api.put(`/sales/tours/${editingTour.id}`, form);
        toast.success("Tour updated!");
      } else {
        await api.post("/sales/tours", form);
        toast.success("Tour scheduled!");
      }
      setShowForm(false);
      setEditingTour(null);
      setForm({ leadId: "", propertyId: "", scheduledDate: "", scheduledTime: "", notes: "" });
      await fetchTours();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save tour");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tour) => {
    setEditingTour(tour);
    setForm({
      leadId: tour.leadId || "",
      propertyId: tour.propertyId || "",
      scheduledDate: tour.scheduledDate || "",
      scheduledTime: tour.scheduledTime || "",
      notes: tour.notes || "",
      status: tour.status || "SCHEDULED",
      feedback: tour.feedback || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this tour?")) return;
    try {
      await api.delete(`/sales/tours/${id}`);
      toast.success("Tour deleted.");
      setTours((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      toast.error("Failed to delete tour.");
    }
  };

  const handleStatusChange = async (tourId, newStatus) => {
    try {
      await api.put(`/sales/tours/${tourId}`, { status: newStatus });
      setTours((prev) => prev.map((t) => (t.id === tourId ? { ...t, status: newStatus } : t)));
      toast.success("Tour status updated!");
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  // Group tours by date
  const groupedTours = tours.reduce((acc, tour) => {
    const date = tour.scheduledDate || "Unknown";
    if (!acc[date]) acc[date] = [];
    acc[date].push(tour);
    return acc;
  }, {});

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
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Property Tours</h1>
        <button
          onClick={() => { setShowForm(true); setEditingTour(null); setForm({ leadId: "", propertyId: "", scheduledDate: "", scheduledTime: "", notes: "" }); }}
          className="flex items-center gap-2 bg-[#C5A572] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#b39362] transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Schedule Tour
        </button>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="relative inline-block">
          <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent appearance-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>
      </div>

      {/* Tour Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">{editingTour ? "Edit Tour" : "Schedule Tour"}</h2>
              <button onClick={() => { setShowForm(false); setEditingTour(null); }} className="text-gray-400 hover:text-gray-600">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead *</label>
                <select value={form.leadId} onChange={(e) => setForm({ ...form, leadId: e.target.value })} required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent">
                  <option value="">Select lead...</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.name} {l.email ? `(${l.email})` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Property *</label>
                <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value })} required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent">
                  <option value="">Select property...</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — {p.location || "N/A"}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
                  <input type="time" value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent" />
                </div>
              </div>
              {editingTour && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent">
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="NO_SHOW">No Show</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent resize-none" />
              </div>
              {editingTour && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                  <textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} rows={2} placeholder="Post-tour feedback..." className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent resize-none" />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#C5A572] text-white font-medium py-2.5 rounded-lg hover:bg-[#b39362] disabled:opacity-60 transition-colors">
                  {saving ? "Saving..." : editingTour ? "Update Tour" : "Schedule Tour"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingTour(null); }} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tours List grouped by date */}
      {tours.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <HiOutlineCalendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No tours found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTours).sort(([a], [b]) => a.localeCompare(b)).map(([date, dateTours]) => (
            <div key={date}>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">{new Date(date + "T00:00").toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h3>
              <div className="space-y-3">
                {dateTours.map((tour) => (
                  <div key={tour.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-[#C5A572]/30 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-semibold text-[#C5A572]">{tour.scheduledTime}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${TOUR_STATUS_COLORS[tour.status] || ""}`}>
                            {tour.status?.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-[#1A1A1A]">{tour.lead?.name || "Unknown Lead"}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500 mt-1">
                          {tour.lead?.phone && <span>{tour.lead.phone}</span>}
                          {tour.lead?.email && <span>{tour.lead.email}</span>}
                        </div>
                        <p className="text-sm text-[#C5A572] mt-1">{tour.property?.name} — {tour.property?.location}</p>
                        {tour.notes && <p className="text-sm text-gray-400 mt-2">{tour.notes}</p>}
                        {tour.feedback && (
                          <div className="mt-2 pl-3 border-l-2 border-[#C5A572]">
                            <p className="text-sm text-gray-600">{tour.feedback}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={tour.status}
                          onChange={(e) => handleStatusChange(tour.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                        >
                          <option value="SCHEDULED">Scheduled</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="NO_SHOW">No Show</option>
                        </select>
                        <button onClick={() => handleEdit(tour)} className="p-2 text-gray-400 hover:text-[#C5A572] transition-colors">
                          <HiOutlinePencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(tour.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
