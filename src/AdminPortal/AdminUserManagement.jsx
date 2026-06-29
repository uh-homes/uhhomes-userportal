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
} from "react-icons/hi";

const PERMISSION_MODULES = [
  {
    key: "dashboard",
    label: "Dashboard",
    description: "View project overview and stats",
    actions: ["read", "write"],
  },
  {
    key: "constructionTracker",
    label: "Construction Tracker",
    description: "View construction progress and milestones",
    actions: ["read", "write"],
  },
  {
    key: "timeline",
    label: "Timeline",
    description: "View construction timeline",
    actions: ["read", "write"],
  },
  {
    key: "gallery",
    label: "Photo Gallery",
    description: "View and manage construction photos",
    actions: ["read", "write"],
  },
  {
    key: "documents",
    label: "Documents",
    description: "Access contracts, permits, and blueprints",
    actions: ["read", "write", "upload"],
  },
  {
    key: "inquiries",
    label: "Inquiries",
    description: "Submit and view questions to builder",
    actions: ["read", "write"],
  },
  {
    key: "alerts",
    label: "Alerts & Notifications",
    description: "Receive and manage notifications",
    actions: ["read", "write"],
  },
  {
    key: "favorites",
    label: "Favorites",
    description: "Save and manage favorite properties",
    actions: ["read", "write"],
  },
  {
    key: "profile",
    label: "Profile Settings",
    description: "View and edit personal profile",
    actions: ["read", "write"],
  },
  {
    key: "reports",
    label: "Reports",
    description: "View and download project reports",
    actions: ["read", "download"],
  },
];

const ACTION_LABELS = {
  read: "Read",
  write: "Write",
  upload: "Upload",
  download: "Download",
};

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setPermissions(JSON.parse(JSON.stringify(user.permissions)));
  };

  const handleToggle = (moduleKey, action) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: {
        ...prev[moduleKey],
        [action]: !prev[moduleKey]?.[action],
      },
    }));
  };

  const handleToggleAllRead = (value) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      PERMISSION_MODULES.forEach((mod) => {
        if (updated[mod.key]) {
          updated[mod.key] = { ...updated[mod.key], read: value };
        }
      });
      return updated;
    });
  };

  const handleToggleAllWrite = (value) => {
    setPermissions((prev) => {
      const updated = { ...prev };
      PERMISSION_MODULES.forEach((mod) => {
        if (updated[mod.key] && mod.actions.includes("write")) {
          updated[mod.key] = { ...updated[mod.key], write: value };
        }
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
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, permissions } : u))
      );
      setSelectedUser((prev) => ({ ...prev, permissions }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleResetPermissions = async () => {
    if (!selectedUser) return;
    if (!window.confirm(`Reset permissions for ${selectedUser.fullName} to defaults?`)) return;
    setSaving(true);
    try {
      const res = await api.post(`/admin/permissions/reset/${selectedUser.id}`);
      const newPerms = res.data.data.permissions;
      setPermissions(newPerms);
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, permissions: newPerms } : u))
      );
      setSelectedUser((prev) => ({ ...prev, permissions: newPerms }));
      toast.success("Permissions reset to defaults");
    } catch (err) {
      toast.error("Failed to reset permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSave = async () => {
    if (selectedUsers.length === 0 || !permissions) {
      toast.error("Select users and configure permissions first");
      return;
    }
    setSaving(true);
    try {
      await api.put("/admin/permissions/bulk/update", {
        userIds: selectedUsers,
        permissions,
      });
      toast.success(`Permissions updated for ${selectedUsers.length} user(s)`);
      fetchUsers();
      setSelectedUsers([]);
      setBulkMode(false);
    } catch (err) {
      toast.error("Failed to bulk update permissions");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllBulk = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getPermissionCount = (perms) => {
    if (!perms) return { enabled: 0, total: 0 };
    let enabled = 0;
    let total = 0;
    PERMISSION_MODULES.forEach((mod) => {
      mod.actions.forEach((action) => {
        total++;
        if (perms[mod.key]?.[action]) enabled++;
      });
    });
    return { enabled, total };
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <HiOutlineShieldCheck className="text-[#C5A572]" />
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Control access permissions for all users — toggle read, write, upload, and download access per module.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
            {users.length} users
          </span>
          <button
            onClick={() => {
              setBulkMode(!bulkMode);
              setSelectedUsers([]);
              if (!bulkMode) setSelectedUser(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
              bulkMode
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-[#C5A572]/10 text-[#C5A572] border border-[#C5A572]/30 hover:bg-[#C5A572]/20"
            }`}
          >
            <HiOutlineUserGroup className="text-lg" />
            {bulkMode ? "Cancel Bulk" : "Bulk Edit"}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List (Left Panel) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase">Select User</span>
              {bulkMode && (
                <button
                  onClick={handleSelectAllBulk}
                  className="text-xs text-[#C5A572] hover:underline"
                >
                  {selectedUsers.length === filteredUsers.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>
            <div className="max-h-[65vh] overflow-y-auto divide-y divide-gray-50">
              {filteredUsers.map((user) => {
                const { enabled, total } = getPermissionCount(user.permissions);
                const isSelected = selectedUser?.id === user.id;
                const isBulkSelected = selectedUsers.includes(user.id);

                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      if (bulkMode) {
                        handleBulkSelect(user.id);
                      } else {
                        handleSelectUser(user);
                      }
                    }}
                    className={`px-4 py-3 cursor-pointer transition-all ${
                      isSelected && !bulkMode
                        ? "bg-[#C5A572]/10 border-l-3 border-l-[#C5A572]"
                        : isBulkSelected
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {bulkMode && (
                        <input
                          type="checkbox"
                          checked={isBulkSelected}
                          onChange={() => handleBulkSelect(user.id)}
                          className="w-4 h-4 accent-[#C5A572] rounded"
                        />
                      )}
                      <div className="w-9 h-9 rounded-full bg-[#C5A572] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-[#1A1A1A] truncate">{user.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs text-gray-400">
                          {enabled}/{total}
                        </span>
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mt-1">
                          <div
                            className="h-full bg-[#C5A572] rounded-full transition-all"
                            style={{ width: `${(enabled / total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">No users found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Permissions Panel (Right) */}
        <div className="lg:col-span-2">
          {!selectedUser && !bulkMode && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center min-h-[60vh]">
              <div className="text-center text-gray-400">
                <HiOutlineShieldCheck className="text-5xl mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium">Select a user</p>
                <p className="text-sm mt-1">Click on a user to manage their permissions</p>
              </div>
            </div>
          )}

          {(selectedUser || bulkMode) && permissions && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Panel Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    {bulkMode ? (
                      <h2 className="text-lg font-bold text-[#1A1A1A]">
                        Bulk Edit — {selectedUsers.length} user(s) selected
                      </h2>
                    ) : (
                      <h2 className="text-lg font-bold text-[#1A1A1A]">
                        {selectedUser.fullName}
                      </h2>
                    )}
                    {!bulkMode && (
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!bulkMode && (
                      <button
                        onClick={handleResetPermissions}
                        disabled={saving}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-1 disabled:opacity-50"
                      >
                        <HiOutlineRefresh className="text-sm" /> Reset
                      </button>
                    )}
                    <button
                      onClick={bulkMode ? handleBulkSave : handleSavePermissions}
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

                {/* Quick actions */}
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => handleToggleAllRead(true)}
                    className="text-xs px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100"
                  >
                    Enable All Read
                  </button>
                  <button
                    onClick={() => handleToggleAllRead(false)}
                    className="text-xs px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100"
                  >
                    Disable All Read
                  </button>
                  <button
                    onClick={() => handleToggleAllWrite(true)}
                    className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100"
                  >
                    Enable All Write
                  </button>
                  <button
                    onClick={() => handleToggleAllWrite(false)}
                    className="text-xs px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100"
                  >
                    Disable All Write
                  </button>
                </div>
              </div>

              {/* Permission Toggles */}
              <div className="p-6 max-h-[55vh] overflow-y-auto">
                <div className="space-y-4">
                  {PERMISSION_MODULES.map((mod) => (
                    <div
                      key={mod.key}
                      className="border border-gray-100 rounded-xl p-4 hover:border-[#C5A572]/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#1A1A1A] text-sm">{mod.label}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{mod.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 mt-3">
                        {mod.actions.map((action) => {
                          const isEnabled = permissions[mod.key]?.[action] ?? false;
                          const colorClass = ACTION_COLORS[action];
                          return (
                            <div key={action} className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggle(mod.key, action)}
                                className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#C5A572] focus:ring-offset-1 ${
                                  isEnabled ? colorClass.on : colorClass.off
                                }`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                                    isEnabled ? "translate-x-5.5 ml-[22px]" : "translate-x-0.5 ml-[2px]"
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-xs font-medium ${
                                  isEnabled ? "text-gray-700" : "text-gray-400"
                                }`}
                              >
                                {ACTION_LABELS[action]}
                              </span>
                              {isEnabled ? (
                                <HiOutlineCheck className="text-green-500 text-xs" />
                              ) : (
                                <HiOutlineX className="text-gray-300 text-xs" />
                              )}
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
                  <span>
                    {(() => {
                      const { enabled, total } = getPermissionCount(permissions);
                      return `${enabled} of ${total} permissions enabled`;
                    })()}
                  </span>
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
