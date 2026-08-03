import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineHome,
  HiOutlineBriefcase,
  HiOutlineCurrencyDollar,
  HiOutlineStar,
  HiOutlineSwitchHorizontal,
  HiOutlinePlus,
  HiOutlineClipboardList,
} from "react-icons/hi";

const CATEGORIES = [
  { key: "homebuyer", label: "Homebuyers", icon: <HiOutlineHome />, color: "text-green-600", bg: "bg-green-50", border: "border-green-200", activeBg: "bg-green-600" },
  { key: "project_manager", label: "Project Managers", icon: <HiOutlineBriefcase />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", activeBg: "bg-blue-600" },
  { key: "sales_agent", label: "Sales Agents", icon: <HiOutlineCurrencyDollar />, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", activeBg: "bg-purple-600" },
  { key: "site_supervisor", label: "Site Supervisors", icon: <HiOutlineClipboardList />, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-200", activeBg: "bg-teal-600" },
  { key: "super_admin", label: "Super Admins", icon: <HiOutlineStar />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", activeBg: "bg-amber-600" },
];

const PERMISSION_MODULES = [
  { key: "dashboard", label: "Dashboard", description: "View project overview and stats", actions: ["read", "write"] },
  { key: "constructionTracker", label: "Construction Tracker", description: "View construction progress and milestones", actions: ["read", "write"] },
  { key: "timeline", label: "Timeline", description: "View construction timeline", actions: ["read", "write"] },
  { key: "gallery", label: "Photo Gallery", description: "View and manage construction photos", actions: ["read", "write"] },
  { key: "documents", label: "Documents", description: "Access contracts, permits, and blueprints", actions: ["read", "write", "upload"] },
  { key: "inquiries", label: "Inquiries", description: "Submit and view questions to builder", actions: ["read", "write"] },
  { key: "alerts", label: "Alerts & Notifications", description: "Receive and manage notifications", actions: ["read", "write"] },
  { key: "favorites", label: "Favorites", description: "Save and manage favorite properties", actions: ["read", "write"] },
  { key: "profile", label: "Profile Settings", description: "View and edit personal profile", actions: ["read", "write"] },
  { key: "reports", label: "Reports", description: "View and download project reports", actions: ["read", "download"] },
];

const ACTION_LABELS = { read: "Read", write: "Write", upload: "Upload", download: "Download" };
const ACTION_COLORS = {
  read: { on: "bg-green-500", off: "bg-gray-300" },
  write: { on: "bg-blue-500", off: "bg-gray-300" },
  upload: { on: "bg-purple-500", off: "bg-gray-300" },
  download: { on: "bg-orange-500", off: "bg-gray-300" },
};

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("homebuyer");
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [saving, setSaving] = useState(false);
  const [movingUser, setMovingUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", phone: "", password: "", category: "homebuyer" });
  const [addingUser, setAddingUser] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/permissions");
      setUsers(res.data.data);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setPermissions(JSON.parse(JSON.stringify(user.permissions)));
  };

  const handleToggle = (moduleKey, action) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: { ...prev[moduleKey], [action]: !prev[moduleKey]?.[action] },
    }));
  };

  const handleToggleAllRead = (value) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      PERMISSION_MODULES.forEach((mod) => {
        if (updated[mod.key]) updated[mod.key] = { ...updated[mod.key], read: value };
      });
      return updated;
    });
  };

  const handleToggleAllWrite = (value) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      PERMISSION_MODULES.forEach((mod) => {
        if (updated[mod.key] && mod.actions.includes("write"))
          updated[mod.key] = { ...updated[mod.key], write: value };
      });
      return updated;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await api.put(`/admin/permissions/${selectedUser.id}`, { permissions });
      toast.success(`Permissions updated for ${selectedUser.fullName}`);
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, permissions } : u)));
      setSelectedUser((prev) => ({ ...prev, permissions }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPermissions = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Reset permissions for ${selectedUser.fullName} to category defaults?`)) return;
    setSaving(true);
    try {
      const res = await api.post(`/admin/permissions/reset/${selectedUser.id}`);
      const newPerms = res.data.data.permissions;
      setPermissions(newPerms);
      setUsers((prev) => prev.map((u) => (u.id === selectedUser.id ? { ...u, permissions: newPerms } : u)));
      setSelectedUser((prev) => ({ ...prev, permissions: newPerms }));
      toast.success("Permissions reset to category defaults");
    } catch (err) {
      toast.error("Failed to reset permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleMoveUser = async (userId, newCategory) => {
    try {
      setMovingUser(userId);
      await api.put(`/admin/permissions/category/${userId}`, { category: newCategory });
      toast.success(`User moved to ${CATEGORIES.find((c) => c.key === newCategory)?.label}`);
      await fetchUsers();
      setSelectedUser(null);
      setPermissions(null);
    } catch (err) {
      toast.error("Failed to move user");
    } finally {
      setMovingUser(null);
    }
  };

  const categoryUsers = users.filter((u) => u.category === activeCategory);
  const filteredUsers = categoryUsers.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getPermissionCount = (perms) => {
    if (!perms) return { enabled: 0, total: 0 };
    let enabled = 0, total = 0;
    PERMISSION_MODULES.forEach((mod) => {
      mod.actions.forEach((action) => { total++; if (perms[mod.key]?.[action]) enabled++; });
    });
    return { enabled, total };
  };

  const getCategoryCounts = () => {
    const counts = {};
    CATEGORIES.forEach((c) => { counts[c.key] = users.filter((u) => u.category === c.key).length; });
    return counts;
  };

  const categoryCounts = getCategoryCounts();

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.email || !newUser.password) {
      toast.error("Full name, email, and password are required.");
      return;
    }
    setAddingUser(true);
    try {
      const payload = {
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone || undefined,
        password: newUser.password,
        role: newUser.category === "super_admin" ? "admin" : "user",
      };
      // Use supervisor endpoint for site_supervisor, otherwise general createUser
      if (newUser.category === "site_supervisor") {
        await api.post("/admin/supervisors", payload);
      } else {
        const res = await api.post("/admin/users", payload);
        // Update category if not homebuyer (default)
        if (newUser.category !== "homebuyer" && newUser.category !== "super_admin") {
          await api.put(`/admin/permissions/category/${res.data.data.id}`, { category: newUser.category });
        }
      }
      toast.success(`User "${newUser.fullName}" created as ${CATEGORIES.find(c => c.key === newUser.category)?.label}`);
      setShowAddUser(false);
      setNewUser({ fullName: "", email: "", phone: "", password: "", category: "homebuyer" });
      await fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setAddingUser(false);
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
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <HiOutlineShieldCheck className="text-[#C5A572]" />
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage users by category — control read, write, upload, and download access per module.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddUser(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors shadow-sm"
          >
            <HiOutlinePlus className="text-base" /> Add User
          </button>
          <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
            {users.length} total users
          </span>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowAddUser(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                  placeholder="Minimum 6 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select
                  value={newUser.category}
                  onChange={(e) => setNewUser({ ...newUser, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingUser}
                  className="px-4 py-2 text-sm text-white bg-[#C5A572] rounded-lg hover:bg-[#b39362] disabled:opacity-60 transition-colors flex items-center gap-1.5"
                >
                  {addingUser && <span className="h-3.5 w-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></span>}
                  {addingUser ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setSelectedUser(null); setPermissions(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                isActive
                  ? `${cat.activeBg} text-white border-transparent shadow-sm`
                  : `${cat.bg} ${cat.color} ${cat.border} hover:shadow-sm`
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              {cat.label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs font-bold ${
                isActive ? "bg-white/20 text-white" : "bg-white text-gray-600"
              }`}>
                {categoryCounts[cat.key] || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search within category */}
      <div className="relative mb-5">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder={`Search in ${CATEGORIES.find((c) => c.key === activeCategory)?.label}...`}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5A572] focus:border-transparent text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List (Left Panel) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                {CATEGORIES.find((c) => c.key === activeCategory)?.label} ({filteredUsers.length})
              </span>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-50">
              {filteredUsers.map((user) => {
                const { enabled, total } = getPermissionCount(user.permissions);
                const isSelected = selectedUser?.id === user.id;
                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`px-4 py-3 cursor-pointer transition-all ${
                      isSelected ? "bg-[#C5A572]/10 border-l-[3px] border-l-[#C5A572]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#C5A572] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#1A1A1A] truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs text-gray-400">{enabled}/{total}</span>
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mt-1">
                          <div className="h-full bg-[#C5A572] rounded-full transition-all" style={{ width: `${(enabled / total) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  <HiOutlineUserGroup className="text-3xl mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No users in this category</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Permissions Panel (Right) */}
        <div className="lg:col-span-2">
          {!selectedUser && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[55vh]">
              <div className="text-center text-gray-400">
                <HiOutlineShieldCheck className="text-5xl mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">Select a user</p>
                <p className="text-sm mt-1">Click on a user to manage their access controls</p>
              </div>
            </div>
          )}

          {selectedUser && permissions && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Panel Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-[#1A1A1A]">{selectedUser.fullName}</h2>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetPermissions}
                      disabled={saving}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 disabled:opacity-50"
                    >
                      <HiOutlineRefresh className="text-sm" /> Reset
                    </button>
                    <button
                      onClick={handleSavePermissions}
                      disabled={saving}
                      className="px-4 py-1.5 text-xs font-medium text-white bg-[#C5A572] hover:bg-[#b39362] rounded-lg flex items-center gap-1 disabled:opacity-50"
                    >
                      {saving ? (
                        <span className="block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <HiOutlineCheck className="text-sm" />
                      )}
                      Save Changes
                    </button>
                  </div>
                </div>

                {/* Move to category */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <HiOutlineSwitchHorizontal className="text-sm" /> Move to:
                  </span>
                  {CATEGORIES.filter((c) => c.key !== activeCategory).map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => handleMoveUser(selectedUser.id, cat.key)}
                      disabled={movingUser === selectedUser.id}
                      className={`text-xs px-2.5 py-1 rounded-md border ${cat.border} ${cat.bg} ${cat.color} hover:shadow-sm disabled:opacity-50 font-medium`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => handleToggleAllRead(true)} className="text-xs px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100">All Read On</button>
                  <button onClick={() => handleToggleAllRead(false)} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100">All Read Off</button>
                  <button onClick={() => handleToggleAllWrite(true)} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100">All Write On</button>
                  <button onClick={() => handleToggleAllWrite(false)} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100">All Write Off</button>
                </div>
              </div>

              {/* Permission Toggles */}
              <div className="p-5 max-h-[48vh] overflow-y-auto">
                <div className="space-y-3">
                  {PERMISSION_MODULES.map((mod) => (
                    <div key={mod.key} className="border border-gray-100 rounded-xl p-4 hover:border-[#C5A572]/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#1A1A1A] text-sm">{mod.label}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{mod.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-5 mt-3">
                        {mod.actions.map((action) => {
                          const isEnabled = permissions[mod.key]?.[action] ?? false;
                          const colorClass = ACTION_COLORS[action];
                          return (
                            <div key={action} className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggle(mod.key, action)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572] focus:ring-offset-1 ${
                                  isEnabled ? colorClass.on : colorClass.off
                                }`}
                              >
                                <span className={`absolute h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${isEnabled ? "translate-x-[22px]" : "translate-x-[3px]"}`} />
                              </button>
                              <span className={`text-xs font-medium ${isEnabled ? "text-gray-700" : "text-gray-400"}`}>
                                {ACTION_LABELS[action]}
                              </span>
                              {isEnabled ? <HiOutlineCheck className="text-green-500 text-xs" /> : <HiOutlineX className="text-gray-300 text-xs" />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{(() => { const { enabled, total } = getPermissionCount(permissions); return `${enabled} of ${total} permissions enabled`; })()}</span>
                  <span className="text-gray-400">Changes are not saved until you click "Save Changes"</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
