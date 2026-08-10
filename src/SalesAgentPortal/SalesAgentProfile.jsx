import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";

export default function SalesAgentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/sales/profile");
        setProfile(res.data.data);
        setForm({
          fullName: res.data.data.fullName || "",
          phone: res.data.data.phone || "",
          address: res.data.data.address || "",
        });
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/sales/profile", form);
      setProfile(res.data.data);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
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
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Profile Settings</h1>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-[#C5A572] flex items-center justify-center text-white text-2xl font-bold">
              {profile?.fullName?.charAt(0).toUpperCase() || "S"}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A1A]">{profile?.fullName}</h2>
              <p className="text-sm text-gray-500">{profile?.email}</p>
              <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200 mt-1 inline-block">Sales Agent</span>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} maxLength={10} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-[#C5A572] text-white font-medium px-6 py-2.5 rounded-lg hover:bg-[#b39362] disabled:opacity-60 transition-colors">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" onClick={() => setEditing(false)} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Full Name</p>
                  <p className="text-sm text-[#1A1A1A] mt-1">{profile?.fullName || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm text-[#1A1A1A] mt-1">{profile?.email || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm text-[#1A1A1A] mt-1">{profile?.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="text-sm text-[#1A1A1A] mt-1">{profile?.address || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Member Since</p>
                  <p className="text-sm text-[#1A1A1A] mt-1">{new Date(profile?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => setEditing(true)} className="bg-[#C5A572] text-white font-medium px-6 py-2.5 rounded-lg hover:bg-[#b39362] transition-colors mt-4">
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
