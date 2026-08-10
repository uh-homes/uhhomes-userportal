import { useEffect, useState } from "react";
import api from "../Api/api";
import { toast } from "react-toastify";
import {
  HiOutlineShieldCheck,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineDownload,
  HiOutlinePencil,
  HiOutlineX,
} from "react-icons/hi";

export default function PMWarranties() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [warranties, setWarranties] = useState([]);
  const [warrantyConfigs, setWarrantyConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    type: "WARRANTY",
    warrantyType: "",
    name: "",
    description: "",
    issueDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    notes: "",
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [projRes, configRes] = await Promise.all([
          api.get("/pm/projects"),
          api.get("/pm/warranty-configs"),
        ]);
        setProjects(projRes.data.data);
        setWarrantyConfigs(configRes.data.data);
        if (projRes.data.data.length > 0) setSelectedProject(projRes.data.data[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedProject) fetchWarranties();
  }, [selectedProject]);

  const fetchWarranties = async () => {
    try {
      const res = await api.get(`/pm/projects/${selectedProject}/warranties`);
      setWarranties(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWarrantyTypeChange = (warrantyType) => {
    setForm((prev) => ({ ...prev, warrantyType }));
    // Auto-fill expiry based on config
    if (warrantyType && form.issueDate) {
      const config = warrantyConfigs.find((c) => c.warrantyType === warrantyType);
      if (config) {
        const issue = new Date(form.issueDate);
        issue.setMonth(issue.getMonth() + config.defaultValidityMonths);
        setForm((prev) => ({ ...prev, warrantyType, expiryDate: issue.toISOString().split("T")[0] }));
      }
    }
  };

  const handleIssueDateChange = (issueDate) => {
    setForm((prev) => ({ ...prev, issueDate }));
    // Recalculate expiry if warrantyType is set
    if (form.warrantyType && issueDate) {
      const config = warrantyConfigs.find((c) => c.warrantyType === form.warrantyType);
      if (config) {
        const issue = new Date(issueDate);
        issue.setMonth(issue.getMonth() + config.defaultValidityMonths);
        setForm((prev) => ({ ...prev, issueDate, expiryDate: issue.toISOString().split("T")[0] }));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!form.name) {
      toast.error("Please provide a name for the document");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", form.type);
    formData.append("warrantyType", form.warrantyType);
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("issueDate", form.issueDate);
    if (form.expiryDate) formData.append("expiryDate", form.expiryDate);
    if (form.notes) formData.append("notes", form.notes);

    setUploading(true);
    try {
      await api.post(`/pm/projects/${selectedProject}/warranties`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${form.type === "COMPLETION_CERTIFICATE" ? "Certificate" : "Warranty"} uploaded successfully`);
      setShowUpload(false);
      setForm({ type: "WARRANTY", warrantyType: "", name: "", description: "", issueDate: new Date().toISOString().split("T")[0], expiryDate: "", notes: "" });
      setFile(null);
      fetchWarranties();
    } catch (err) {
      toast.error("Failed to upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this warranty/certificate?")) return;
    try {
      await api.delete(`/pm/warranties/${id}`);
      toast.success("Deleted successfully");
      fetchWarranties();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const getStatusColor = (warranty) => {
    if (warranty.status === "REVOKED") return "bg-red-100 text-red-700";
    if (warranty.status === "EXPIRED") return "bg-gray-100 text-gray-600";
    if (warranty.expiryDate && new Date(warranty.expiryDate) < new Date()) return "bg-orange-100 text-orange-700";
    return "bg-green-100 text-green-700";
  };

  const getStatusLabel = (warranty) => {
    if (warranty.status === "REVOKED") return "Revoked";
    if (warranty.status === "EXPIRED") return "Expired";
    if (warranty.expiryDate && new Date(warranty.expiryDate) < new Date()) return "Expired";
    return "Active";
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
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
        <HiOutlineShieldCheck className="text-[#C5A572]" /> Warranties & Certificates
      </h1>

      <div className="flex items-center gap-4 mb-6">
        {projects.length > 0 && (
          <select
            value={selectedProject || ""}
            onChange={(e) => setSelectedProject(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}

        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#C5A572] text-white text-sm font-medium rounded-lg hover:bg-[#b39362] transition-colors"
        >
          <HiOutlinePlus /> Upload Warranty / Certificate
        </button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4" onClick={() => setShowUpload(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Upload Warranty / Certificate</h2>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 hover:text-gray-600">
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3">
              {/* Document Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Document Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
                >
                  <option value="WARRANTY">Warranty</option>
                  <option value="COMPLETION_CERTIFICATE">Completion Certificate</option>
                </select>
              </div>

              {/* Warranty Type (from admin config) */}
              {form.type === "WARRANTY" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Warranty Category</label>
                  <select
                    value={form.warrantyType}
                    onChange={(e) => handleWarrantyTypeChange(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
                  >
                    <option value="">Select warranty type...</option>
                    {warrantyConfigs.map((config) => (
                      <option key={config.id} value={config.warrantyType}>
                        {config.warrantyType} ({config.defaultValidityMonths} months)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Document Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Document Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g., Structural Warranty Certificate"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] resize-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    value={form.issueDate}
                    onChange={(e) => handleIssueDateChange(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Expiry Date {form.type === "COMPLETION_CERTIFICATE" ? "(optional)" : ""}
                  </label>
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
                  />
                </div>
              </div>

              {form.warrantyType && form.expiryDate && (
                <p className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                  Validity auto-calculated from admin configuration
                </p>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <input
                  type="text"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Upload File *</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:bg-[#C5A572] file:text-white file:text-xs file:cursor-pointer"
                />
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG accepted</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 text-sm text-white bg-[#C5A572] rounded-lg hover:bg-[#b39362] disabled:opacity-60 flex items-center gap-1.5"
                >
                  {uploading && <span className="h-3.5 w-3.5 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></span>}
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Warranties List */}
      {warranties.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <HiOutlineShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No warranties or certificates uploaded yet.</p>
          <p className="text-sm mt-1">Upload warranty documentation or completion certificates for buyers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {warranties.map((w) => (
            <div key={w.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    w.type === "COMPLETION_CERTIFICATE" ? "bg-blue-50" : "bg-green-50"
                  }`}>
                    <HiOutlineShieldCheck className={`w-5 h-5 ${
                      w.type === "COMPLETION_CERTIFICATE" ? "text-blue-600" : "text-green-600"
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1A1A1A]">{w.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        w.type === "COMPLETION_CERTIFICATE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {w.type === "COMPLETION_CERTIFICATE" ? "Completion Certificate" : "Warranty"}
                      </span>
                      {w.warrantyType && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {w.warrantyType}
                        </span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(w)}`}>
                        {getStatusLabel(w)}
                      </span>
                    </div>
                    {w.description && <p className="text-xs text-gray-500 mt-1">{w.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>Issued: {new Date(w.issueDate).toLocaleDateString()}</span>
                      {w.expiryDate && <span>Expires: {new Date(w.expiryDate).toLocaleDateString()}</span>}
                      {w.validityMonths && <span>({w.validityMonths} months)</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {w.url && (
                    <a
                      href={w.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[#C5A572] hover:bg-[#FAF7F2] rounded-lg transition-colors"
                      title="Download"
                    >
                      <HiOutlineDownload className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(w.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
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
