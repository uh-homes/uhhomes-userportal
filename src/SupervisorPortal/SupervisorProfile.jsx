import { useState, useEffect } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";

export default function SupervisorProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", address: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/supervisor/profile");
        setProfile(res.data.data);
        setForm({
          fullName: res.data.data.fullName || "",
          phone: res.data.data.phone || "",
          address: res.data.data.address || "",
        });
      } catch (err) {
        console.error(err);
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
      const res = await api.put("/supervisor/profile", form);
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

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Account Information</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-[#C5A572] hover:text-[#b39362] font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                maxLength={10}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#C5A572] text-white px-4 py-2 rounded-lg hover:bg-[#b39362] disabled:opacity-60 text-sm"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Name</label>
              <p className="text-[#1A1A1A] font-medium">{profile?.fullName}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Email</label>
              <p className="text-[#1A1A1A] font-medium">{profile?.email}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Phone</label>
              <p className="text-[#1A1A1A] font-medium">{profile?.phone || "—"}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Address</label>
              <p className="text-[#1A1A1A] font-medium">{profile?.address || "—"}</p>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Role</label>
              <span className="bg-[#C5A572] text-white text-xs px-3 py-1 rounded-full">Site Supervisor</span>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Member since</label>
              <p className="text-[#1A1A1A] font-medium">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
