import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { toast } from "react-toastify";

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProp, setEditProp] = useState(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    thumbnail: "",
    price: "",
    location: "",
    bedrooms: "",
    bathrooms: "",
    halfBathCount: "",
    squareFeet: "",
    garageSpaces: "",
    storyCount: "",
    description: "",
  });

  const fetchProperties = async () => {
    try {
      const res = await api.get("/admin/properties");
      setProperties(res.data.data);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-") };
      if (editProp) {
        await api.put(`/admin/properties/${editProp.id}`, payload);
        toast.success("Property updated!");
      } else {
        await api.post("/admin/properties", payload);
        toast.success("Property created!");
      }
      setShowForm(false);
      setEditProp(null);
      resetForm();
      fetchProperties();
    } catch (err) {
      toast.error("Failed to save property");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this property?")) return;
    try {
      await api.delete(`/admin/properties/${id}`);
      toast.success("Property deleted");
      fetchProperties();
    } catch (err) {
      toast.error("Failed to delete property");
    }
  };

  const openEdit = (prop) => {
    setEditProp(prop);
    setForm({
      name: prop.name || "",
      slug: prop.slug || "",
      thumbnail: prop.thumbnail || "",
      price: prop.price || "",
      location: prop.location || "",
      bedrooms: prop.bedrooms || "",
      bathrooms: prop.bathrooms || "",
      halfBathCount: prop.halfBathCount || "",
      squareFeet: prop.squareFeet || "",
      garageSpaces: prop.garageSpaces || "",
      storyCount: prop.storyCount || "",
      description: prop.description || "",
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ name: "", slug: "", thumbnail: "", price: "", location: "", bedrooms: "", bathrooms: "", halfBathCount: "", squareFeet: "", garageSpaces: "", storyCount: "", description: "" });
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
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Properties Management</h1>
        <button
          onClick={() => { setShowForm(true); setEditProp(null); resetForm(); }}
          className="bg-[#C5A572] text-white px-4 py-2 rounded-lg hover:bg-[#b39362] transition-colors flex items-center gap-2"
        >
          <HiOutlinePlus className="text-lg" />
          Add Property
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h2 className="font-semibold text-[#1A1A1A] mb-4">{editProp ? "Edit Property" : "New Property"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input type="text" required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Location</label>
              <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Price ($)</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Thumbnail URL</label>
              <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bedrooms</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Bathrooms</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Half Baths</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.halfBathCount} onChange={(e) => setForm({ ...form, halfBathCount: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Sq. Ft.</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.squareFeet} onChange={(e) => setForm({ ...form, squareFeet: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Garage Spaces</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.garageSpaces} onChange={(e) => setForm({ ...form, garageSpaces: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Stories</label>
              <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.storyCount} onChange={(e) => setForm({ ...form, storyCount: e.target.value })} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#C5A572] text-white px-4 py-2 rounded-lg hover:bg-[#b39362]">{editProp ? "Update" : "Create"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditProp(null); }} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {properties.map((prop) => (
          <div key={prop.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {prop.thumbnail && (
              <img src={prop.thumbnail} alt={prop.name} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">{prop.name}</h3>
                  <p className="text-xs text-gray-500">{prop.location}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(prop)} className="p-1.5 text-gray-400 hover:text-[#C5A572] rounded">
                    <HiOutlinePencil className="text-sm" />
                  </button>
                  <button onClick={() => handleDelete(prop.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                    <HiOutlineTrash className="text-sm" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs text-gray-600">
                <span>{prop.bedrooms} Bed</span>
                <span>{prop.bathrooms} Bath</span>
                <span>{prop.squareFeet} SqFt</span>
                <span>{prop.storyCount} Story</span>
                <span>{prop.garageSpaces} Garage</span>
                <span>{prop.halfBathCount} Half Bath</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {properties.length === 0 && (
        <div className="text-center py-10 text-gray-500">No properties yet.</div>
      )}
    </div>
  );
}
