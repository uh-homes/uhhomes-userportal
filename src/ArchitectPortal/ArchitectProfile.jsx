import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../Api/api";
import { toast } from "react-toastify";
import { updateUser } from "../store/slice/userSlice";
import { HiOutlineCog, HiOutlineUser, HiOutlineMail, HiOutlinePhone } from "react-icons/hi";

export default function ArchitectProfile() {
  const user = useSelector((state) => state?.user);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialization: user?.specialization || "",
    experience: user?.experience || "",
    portfolio: user?.portfolio || "",
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put("/architect/profile", formData);
      dispatch(updateUser(res.data.data || formData));
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <HiOutlineCog className="text-[#C5A572]" />
            Profile Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your profile information</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="max-w-2xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-[#C5A572] flex items-center justify-center text-white font-bold text-2xl">
              {user?.fullName?.charAt(0).toUpperCase() || "A"}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#1A1A1A]">{user?.fullName}</h2>
              <p className="text-sm text-gray-500">Architect</p>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  maxLength={10}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Specialization</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="e.g. Residential Architecture, Interior Design"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Years of Experience</label>
                <input
                  type="text"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="e.g. 10 years"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Portfolio URL</label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <HiOutlineUser className="text-[#C5A572]" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{user?.fullName || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HiOutlineMail className="text-[#C5A572]" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{user?.email || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HiOutlinePhone className="text-[#C5A572]" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-medium text-[#1A1A1A]">{user?.phone || "—"}</p>
                </div>
              </div>
              {user?.specialization && (
                <div className="flex items-center gap-3">
                  <HiOutlineCog className="text-[#C5A572]" />
                  <div>
                    <p className="text-xs text-gray-500">Specialization</p>
                    <p className="text-sm font-medium text-[#1A1A1A]">{user.specialization}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Note about no financial access */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-700">
            <strong>Note:</strong> As an Architect, you have access to design-related modules only. 
            Financial data and billing information are not accessible from this portal.
          </p>
        </div>
      </div>
    </div>
  );
}
