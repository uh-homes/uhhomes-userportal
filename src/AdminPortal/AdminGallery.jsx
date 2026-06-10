import React, { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePhotograph, HiOutlineUpload } from "react-icons/hi";
import { toast } from "react-toastify";
import Lightbox from "../Components/Lightbox";

export default function AdminGallery() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddPhotos, setShowAddPhotos] = useState(null);
  const [newGallery, setNewGallery] = useState({ phase: "", caption: "" });
  const [photoUrls, setPhotoUrls] = useState("");
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const defaultPhases = [
    "Site Preparation",
    "Foundation",
    "Framing & Roofing",
    "Electrical & Plumbing",
    "Interior Finishing",
    "Exterior & Landscaping",
    "Final Inspection",
  ];
  const [customPhases, setCustomPhases] = useState([]);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPhaseName, setCustomPhaseName] = useState("");
  const phases = [...defaultPhases, ...customPhases];

  const fetchProjects = async () => {
    try {
      const res = await api.get("/admin/projects");
      setProjects(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedProject(res.data.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleries = async (projectId) => {
    if (!projectId) return;
    try {
      const res = await api.get(`/admin/gallery/${projectId}`);
      setGalleries(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchGalleries(selectedProject.id);
    }
  }, [selectedProject]);

  useEffect(() => {
    const existingPhases = galleries.map((g) => g.phase).filter(Boolean);
    const extras = existingPhases.filter((p) => !defaultPhases.includes(p) && !customPhases.includes(p));
    if (extras.length > 0) {
      setCustomPhases((prev) => [...new Set([...prev, ...extras])]);
    }
  }, [galleries]);

  const handleCreateGallery = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/gallery", {
        projectId: selectedProject.id,
        phase: newGallery.phase,
        caption: newGallery.caption,
      });
      toast.success("Gallery phase created!");
      setShowCreateForm(false);
      setNewGallery({ phase: "", caption: "" });
      fetchGalleries(selectedProject.id);
    } catch (err) {
      toast.error("Failed to create gallery");
    }
  };

  const handleAddPhotos = async (galleryId) => {
    const urls = photoUrls.split("\n").filter((u) => u.trim());
    if (urls.length === 0) {
      toast.error("Enter at least one URL");
      return;
    }
    try {
      await api.post(`/admin/gallery/${galleryId}/photos`, { urls });
      toast.success(`${urls.length} photo(s) added!`);
      setShowAddPhotos(null);
      setPhotoUrls("");
      fetchGalleries(selectedProject.id);
    } catch (err) {
      toast.error("Failed to add photos");
    }
  };

  const handleFileUpload = async (galleryId, files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("photos", file));
      await api.post(`/admin/gallery/${galleryId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(`${files.length} photo(s) uploaded!`);
      fetchGalleries(selectedProject.id);
    } catch (err) {
      toast.error("Failed to upload photos");
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (mediaId) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      await api.delete(`/admin/gallery/photo/${mediaId}`);
      toast.success("Photo deleted");
      fetchGalleries(selectedProject.id);
    } catch (err) {
      toast.error("Failed to delete photo");
    }
  };

  const handleDeleteGallery = async (galleryId) => {
    if (!window.confirm("Delete this entire gallery phase and all its photos?")) return;
    try {
      await api.delete(`/admin/gallery/${galleryId}`);
      toast.success("Gallery deleted");
      fetchGalleries(selectedProject.id);
    } catch (err) {
      toast.error("Failed to delete gallery");
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
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Photo Gallery by Phase</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#C5A572] text-white px-4 py-2 rounded-lg hover:bg-[#b39362] flex items-center gap-2"
        >
          <HiOutlinePlus /> New Phase Gallery
        </button>
      </div>

      {/* Project Selector */}
      <div className="mb-6">
        <select
          className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#C5A572]"
          value={selectedProject?.id || ""}
          onChange={(e) => setSelectedProject(projects.find((p) => p.id === parseInt(e.target.value)))}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name} — {p.user?.fullName}</option>
          ))}
        </select>
      </div>

      {/* Create Gallery Form */}
      {showCreateForm && (
        <form onSubmit={handleCreateGallery} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-semibold mb-3">Add Phase Gallery</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Phase</label>
              {!showCustomInput ? (
                <>
                  <select
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2"
                    value={newGallery.phase}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setShowCustomInput(true);
                        setNewGallery({ ...newGallery, phase: "" });
                      } else {
                        setNewGallery({ ...newGallery, phase: e.target.value });
                      }
                    }}
                  >
                    <option value="">Select Phase</option>
                    {phases.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="__custom__">+ Add New Phase...</option>
                  </select>
                </>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2"
                    placeholder="Enter new phase name"
                    value={customPhaseName}
                    onChange={(e) => setCustomPhaseName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customPhaseName.trim()) {
                        setCustomPhases([...customPhases, customPhaseName.trim()]);
                        setNewGallery({ ...newGallery, phase: customPhaseName.trim() });
                        setCustomPhaseName("");
                        setShowCustomInput(false);
                      }
                    }}
                    className="bg-[#C5A572] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#b39362]"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCustomInput(false); setCustomPhaseName(""); }}
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Caption (optional)</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
                value={newGallery.caption}
                onChange={(e) => setNewGallery({ ...newGallery, caption: e.target.value })}
                placeholder="e.g., Foundation pour complete"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-[#C5A572] text-white px-4 py-2 rounded-lg">Create</button>
            <button type="button" onClick={() => setShowCreateForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      {/* Recent Uploads */}
      {galleries.length > 0 && (() => {
        const recentPhotos = galleries
          .flatMap((g) => (g.media || []).map((m) => ({ ...m, phase: g.phase })))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        if (recentPhotos.length === 0) return null;
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-[#1A1A1A]">Recent Uploads</h3>
              <p className="text-xs text-gray-400 mt-1">Latest photos added across all phases</p>
            </div>
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {recentPhotos.map((photo, idx) => (
                <div key={photo.id} className="relative group rounded-lg overflow-hidden aspect-square cursor-pointer">
                  <img
                    src={photo.url}
                    alt=""
                    className="w-full h-full object-cover"
                    onClick={() => {
                      setLightboxImages(recentPhotos.map((m) => m.url));
                      setLightboxIndex(idx);
                      setLightboxOpen(true);
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white font-medium">{photo.phase}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Galleries */}
      {galleries.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-500 shadow-sm border border-gray-100">
          <HiOutlinePhotograph className="text-4xl mx-auto mb-3 text-gray-300" />
          <p>No photo galleries for this project yet.</p>
          <p className="text-sm">Create a phase gallery and add construction photos.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">{gallery.phase || "Uncategorized"}</h3>
                  {gallery.caption && <p className="text-sm text-gray-500">{gallery.caption}</p>}
                  <p className="text-xs text-gray-400 mt-1">{gallery.media?.length || 0} photos • {new Date(gallery.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddPhotos(showAddPhotos === gallery.id ? null : gallery.id)}
                    className="p-2 text-gray-500 hover:text-[#C5A572] hover:bg-gray-100 rounded-lg"
                    title="Add photos"
                  >
                    <HiOutlinePlus />
                  </button>
                  <button
                    onClick={() => handleDeleteGallery(gallery.id)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    title="Delete gallery"
                  >
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>

              {/* Add Photos Form */}
              {showAddPhotos === gallery.id && (
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                  {/* File Upload from PC */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload from Computer</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#C5A572] hover:bg-[#C5A572]/5 transition-colors">
                        <HiOutlineUpload className="text-[#C5A572]" />
                        <span className="text-sm text-gray-600">{uploading ? "Uploading..." : "Choose Files"}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          disabled={uploading}
                          onChange={(e) => handleFileUpload(gallery.id, e.target.files)}
                        />
                      </label>
                      {uploading && (
                        <span className="block h-4 w-4 border-2 border-[#C5A572] border-t-transparent rounded-full animate-spin"></span>
                      )}
                      <span className="text-xs text-gray-400">JPG, PNG, GIF, WebP (max 10MB each)</span>
                    </div>
                  </div>

                  {/* URL-based add */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Or add via URL (one per line)</label>
                    <textarea
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2"
                      placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                      value={photoUrls}
                      onChange={(e) => setPhotoUrls(e.target.value)}
                    />
                    <button
                      onClick={() => handleAddPhotos(gallery.id)}
                      className="bg-[#C5A572] text-white px-3 py-1.5 rounded-lg text-sm"
                    >
                      Add from URL
                    </button>
                  </div>
                </div>
              )}

              {/* Photo Grid */}
              {gallery.media?.length > 0 && (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {gallery.media.map((photo, photoIdx) => (
                    <div key={photo.id} className="relative group rounded-lg overflow-hidden aspect-square cursor-pointer">
                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-full object-cover"
                        onClick={() => {
                          setLightboxImages(gallery.media.map(m => m.url));
                          setLightboxIndex(photoIdx);
                          setLightboxOpen(true);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center pointer-events-none">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-2 rounded-full transition-opacity pointer-events-auto"
                        >
                          <HiOutlineTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {lightboxOpen && (
        <Lightbox
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={(idx) => setLightboxIndex(idx)}
        />
      )}
    </div>
  );
}
