import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlineShieldCheck,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineX,
} from "react-icons/hi";

export default function AdminWarrantyConfig() {
  const [configs, setConfigs] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ warrantyType: "", defaultValidityMonths: 12, description: "" });
  const [editForm, setEditForm] = useState({ warrantyType: "", defaultValidityMonths: 12, description: "" });
  const [activeTab, setActiveTab] = useState("configs");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, warrantyRes] = await Promise.all([
        api.get("/admin/warranty-configs"),
        api.get("/admin/warranties"),
      ]);
      setConfigs(configRes.data.data);
      setWarranties(warrantyRes.data.data);
    } catch (err) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.warrantyType || !form.defaultValidityMonths) {
      toast.error("Warranty type and validity period are required");
      return;
    }
    try {
      await api.post("/admin/warranty-configs", form);
      toast.success(`Warranty type "${form.warrantyType}" created`);
      setShowCreate(false);
      setForm({ warrantyType: "", defaultValidityMonths: 12, description: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create");
    }
  };

  const handleUpdate = async (id) => {
    try {
      await api.put(`/admin/warranty-configs/${id}`, editForm);
      toast.success("Updated successfully");
      setEditingId(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to update");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete warranty type "${name}"?`)) return;
    try {
      await api.delete(`/admin/warranty-configs/${id}`);
      toast.success("Deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleToggleActive = async (id, currentState) => {
    try {
      await api.put(`/admin/warranty-configs/${id}`, { isActive: !currentState });
      fetchData();
    } catch (err) {
      toast.error("Failed to update");
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
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <HiOutlineShieldCheck className="text-[#C5A572]" />
            Warranty & Certificate Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure warranty types with default validity periods. Project Managers use these to upload buyer warranties.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("configs")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "configs" ? "bg-[#C5A572] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Warranty Types ({configs.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "all" ? "bg-[#C5A572] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All Issued Warranties ({warranties.length})
        </button>
      </div>

      {activeTab === "configs" && (
        <>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors mb-4"
          >
            <HiOutlinePlus /> Add Warranty Type
          </button>

          {/* Create Form */}
          {showCreate && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">New Warranty Type</h3>
              <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={form.warrantyType}
                  onChange={(e) => setForm({ ...form, warrantyType: e.target.value })}
                  placeholder="e.g., Structural, Plumbing, Electrical"
                  required
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={form.defaultValidityMonths}
                    onChange={(e) => setForm({ ...form, defaultValidityMonths: parseInt(e.target.value) })}
                    min={1}
                    required
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] w-24"
                  />
                  <span className="text-sm text-gray-500">months</span>
                </div>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
                />
                <div className="md:col-span-3 flex gap-2">
                  <button type="submit" className="px-4 py-2 bg-[#C5A572] text-white text-sm rounded-lg hover:bg-[#b39362]">
                    Create
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Configs List */}
          {configs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <HiOutlineShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No warranty types configured yet.</p>
              <p className="text-sm mt-1">Add types like "Structural", "Plumbing", "Electrical" with default validity periods.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Warranty Type</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Validity</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Description</th>
                    <th className="text-center text-xs font-medium text-gray-500 uppercase px-5 py-3">Active</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {configs.map((config) => (
                    <tr key={config.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        {editingId === config.id ? (
                          <input
                            type="text"
                            value={editForm.warrantyType}
                            onChange={(e) => setEditForm({ ...editForm, warrantyType: e.target.value })}
                            className="border border-gray-200 rounded px-2 py-1 text-sm w-full"
                          />
                        ) : (
                          <span className="text-sm font-medium text-[#1A1A1A]">{config.warrantyType}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {editingId === config.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={editForm.defaultValidityMonths}
                              onChange={(e) => setEditForm({ ...editForm, defaultValidityMonths: parseInt(e.target.value) })}
                              className="border border-gray-200 rounded px-2 py-1 text-sm w-16"
                              min={1}
                            />
                            <span className="text-xs text-gray-500">mo</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">{config.defaultValidityMonths} months</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {editingId === config.id ? (
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            className="border border-gray-200 rounded px-2 py-1 text-sm w-full"
                          />
                        ) : (
                          <span className="text-sm text-gray-500">{config.description || "-"}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          onClick={() => handleToggleActive(config.id, config.isActive)}
                          className={`w-8 h-5 rounded-full relative transition-colors ${
                            config.isActive ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${
                            config.isActive ? "right-0.5" : "left-0.5"
                          }`}></div>
                        </button>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {editingId === config.id ? (
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => handleUpdate(config.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                              <HiOutlineCheck className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded">
                              <HiOutlineX className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 justify-end">
                            <button
                              onClick={() => { setEditingId(config.id); setEditForm({ warrantyType: config.warrantyType, defaultValidityMonths: config.defaultValidityMonths, description: config.description || "" }); }}
                              className="p-1 text-[#C5A572] hover:bg-[#FAF7F2] rounded"
                            >
                              <HiOutlinePencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(config.id, config.warrantyType)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === "all" && (
        <div>
          {warranties.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No warranties issued yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {warranties.map((w) => {
                const isExpired = w.expiryDate && new Date(w.expiryDate) < new Date();
                return (
                  <div key={w.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-[#1A1A1A]">{w.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            w.type === "COMPLETION_CERTIFICATE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                          }`}>
                            {w.type === "COMPLETION_CERTIFICATE" ? "Certificate" : "Warranty"}
                          </span>
                          {w.warrantyType && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{w.warrantyType}</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            w.status === "REVOKED" ? "bg-red-100 text-red-700" :
                            isExpired ? "bg-orange-100 text-orange-700" :
                            "bg-green-100 text-green-700"
                          }`}>
                            {w.status === "REVOKED" ? "Revoked" : isExpired ? "Expired" : "Active"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          {w.project && <span>Project: {w.project.name}</span>}
                          {w.uploader && <span>By: {w.uploader.fullName}</span>}
                          <span>Issued: {new Date(w.issueDate).toLocaleDateString()}</span>
                          {w.expiryDate && <span>Expires: {new Date(w.expiryDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
