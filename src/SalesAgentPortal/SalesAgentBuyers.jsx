import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlinePlus,
  HiOutlineX,
  HiOutlineUsers,
  HiOutlineSearch,
  HiOutlineEye,
} from "react-icons/hi";

export default function SalesAgentBuyers() {
  const [buyers, setBuyers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ leadId: "", fullName: "", email: "", phone: "", password: "" });
  const [saving, setSaving] = useState(false);

  const fetchBuyers = async () => {
    try {
      const res = await api.get("/sales/buyers");
      setBuyers(res.data.data);
    } catch (err) {
      toast.error("Failed to load buyers");
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await api.get("/sales/leads", { params: { status: "" } });
      // Only show non-converted leads
      setLeads(res.data.data.filter((l) => l.status !== "CONVERTED"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBuyers();
    fetchLeads();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      return toast.error("Full name, email, and password are required.");
    }
    setSaving(true);
    try {
      await api.post("/sales/buyers", {
        leadId: form.leadId || undefined,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      toast.success("Buyer account created!");
      setShowForm(false);
      setForm({ leadId: "", fullName: "", email: "", phone: "", password: "" });
      await fetchBuyers();
      await fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create buyer");
    } finally {
      setSaving(false);
    }
  };

  // Pre-fill form when lead is selected
  const handleLeadSelect = (leadId) => {
    const lead = leads.find((l) => l.id === parseInt(leadId));
    if (lead) {
      setForm({
        ...form,
        leadId: lead.id,
        fullName: lead.name || form.fullName,
        email: lead.email || form.email,
        phone: lead.phone || form.phone,
      });
    } else {
      setForm({ ...form, leadId: "" });
    }
  };

  const fetchBuyerDetail = async (userId) => {
    try {
      const res = await api.get(`/sales/buyers/${userId}`);
      setShowDetail(res.data.data);
    } catch (err) {
      toast.error("Failed to load buyer details");
    }
  };

  const filtered = buyers.filter(
    (b) =>
      b.convertedUser?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      b.convertedUser?.email?.toLowerCase().includes(search.toLowerCase())
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
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Buyer Accounts</h1>
        <button
          onClick={() => { setShowForm(true); setForm({ leadId: "", fullName: "", email: "", phone: "", password: "" }); }}
          className="flex items-center gap-2 bg-[#C5A572] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#b39362] transition-colors"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Onboard Buyer
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72 mb-6">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search buyers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
        />
      </div>

      {/* Onboard Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Onboard New Buyer</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Convert from Lead (optional)</label>
                <select value={form.leadId} onChange={(e) => handleLeadSelect(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent">
                  <option value="">New buyer (no lead)</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.name} {l.email ? `— ${l.email}` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-[#C5A572] text-white font-medium py-2.5 rounded-lg hover:bg-[#b39362] disabled:opacity-60 transition-colors">
                  {saving ? "Creating..." : "Create Buyer Account"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Buyer Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">{showDetail.fullName}</h2>
              <button onClick={() => setShowDetail(null)} className="text-gray-400 hover:text-gray-600">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-[#1A1A1A]">{showDetail.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm text-[#1A1A1A]">{showDetail.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Member Since</p>
                  <p className="text-sm text-[#1A1A1A]">{new Date(showDetail.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {showDetail.projects?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Projects</h3>
                  <div className="space-y-2">
                    {showDetail.projects.map((p) => (
                      <div key={p.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <p className="text-sm font-medium text-[#1A1A1A]">{p.name}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">{p.status?.replace("_", " ")}</span>
                          <span className="text-xs text-[#C5A572]">{p.completionPercentage || 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showDetail.favorites?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Favorites</h3>
                  <div className="flex flex-wrap gap-2">
                    {showDetail.favorites.map((f) => (
                      <span key={f.id} className="text-xs bg-[#C5A572]/10 text-[#C5A572] px-2 py-1 rounded border border-[#C5A572]/20">
                        {f.property?.name || "Property #" + f.propertyId}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Buyers List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <HiOutlineUsers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No buyer accounts yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lead) => (
            <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-[#C5A572]/40 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#C5A572] flex items-center justify-center text-white font-semibold">
                  {lead.convertedUser?.fullName?.charAt(0).toUpperCase() || "B"}
                </div>
                <div>
                  <h3 className="text-[#1A1A1A] font-semibold">{lead.convertedUser?.fullName}</h3>
                  <p className="text-xs text-gray-500">{lead.convertedUser?.email}</p>
                </div>
              </div>
              {lead.property && (
                <p className="text-sm text-gray-500 mb-2">Interested in: <span className="text-[#C5A572]">{lead.property.name}</span></p>
              )}
              {lead.convertedUser?.projects?.length > 0 && (
                <p className="text-xs text-gray-500 mb-2">{lead.convertedUser.projects.length} project(s) assigned</p>
              )}
              <p className="text-xs text-gray-400 mb-3">Onboarded: {new Date(lead.updatedAt).toLocaleDateString()}</p>
              <button
                onClick={() => fetchBuyerDetail(lead.convertedUserId)}
                className="w-full flex items-center justify-center gap-2 bg-[#C5A572]/10 text-[#C5A572] text-sm font-medium rounded-lg px-3 py-2 hover:bg-[#C5A572]/20 transition-colors border border-[#C5A572]/20"
              >
                <HiOutlineEye className="w-4 h-4" />
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
