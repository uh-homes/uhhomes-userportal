import { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlinePhotograph, HiOutlinePlus, HiOutlineUpload } from "react-icons/hi";
import { toast } from "react-toastify";

export default function SupervisorGallery() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadPhase, setUploadPhase] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadFiles, setUploadFiles] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/supervisor/projects");
        setProjects(res.data.data);
        if (res.data.data.length > 0) setSelectedProject(res.data.data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const fetchGallery = async (projectId) => {
    try {
      const res = await api.get(`/supervisor/gallery/${projectId}`);
      setGalleries(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!selectedProject) return;
    fetchGallery(selectedProject.id);
  }, [selectedProject]);

  const handleUploadPhotos = async (e) => {
    e.preventDefault();
    if (!uploadFiles || uploadFiles.length === 0) {
      toast.error("Please select photos to upload");
      return;
    }
    setUploading(true);
    try {
      // Create gallery first
      const galleryRes = await api.post("/supervisor/gallery", {
        projectId: selectedProject.id,
        phase: uploadPhase || "General",
        caption: uploadCaption,
      });
      const galleryId = galleryRes.data.data.id;

      // Upload photos
      const formData = new FormData();
      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append("photos", uploadFiles[i]);
      }
      await api.post(`/supervisor/gallery/${galleryId}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Photos uploaded!");
      setShowUploadForm(false);
      setUploadPhase("");
      setUploadCaption("");
      setUploadFiles(null);
      fetchGallery(selectedProject.id);
    } catch (err) {
      toast.error("Upload failed");
      console.error(err);
    } finally {
      setUploading(false);
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
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Photo Gallery</h1>

      <div className="mb-6 flex items-center gap-4">
        <select
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          value={selectedProject?.id || ""}
          onChange={(e) => setSelectedProject(projects.find((p) => p.id === parseInt(e.target.value)))}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-[#C5A572] text-white px-3 py-2 rounded-lg hover:bg-[#b39362] flex items-center gap-1 text-sm"
        >
          <HiOutlinePlus /> Upload Photos
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <form onSubmit={handleUploadPhotos} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <h3 className="font-medium text-sm mb-3">Upload Photos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phase / Category *</label>
              <input
                type="text"
                required
                placeholder="e.g. Foundation, Framing"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={uploadPhase}
                onChange={(e) => setUploadPhase(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Caption</label>
              <input
                type="text"
                placeholder="Optional description"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Photos *</label>
              <input
                type="file"
                accept="image/*"
                multiple
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
                onChange={(e) => setUploadFiles(e.target.files)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={uploading}
              className="bg-[#C5A572] text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 disabled:opacity-60"
            >
              <HiOutlineUpload /> {uploading ? "Uploading..." : "Upload"}
            </button>
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {galleries.length === 0 ? (
        <div className="bg-white rounded-xl p-10 text-center text-gray-500 shadow-sm border border-gray-100">
          <HiOutlinePhotograph className="text-4xl mx-auto mb-3 text-gray-300" />
          <p>No photo galleries for this project yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-[#1A1A1A]">{gallery.phase || "Uncategorized"}</h3>
                {gallery.caption && <p className="text-sm text-gray-500">{gallery.caption}</p>}
                <p className="text-xs text-gray-400 mt-1">{gallery.media?.length || 0} photos • {new Date(gallery.createdAt).toLocaleDateString()}</p>
              </div>

              {gallery.media?.length > 0 && (
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {gallery.media.map((photo, photoIdx) => (
                    <div
                      key={photo.id}
                      className="relative group rounded-lg overflow-hidden aspect-square cursor-pointer"
                      onClick={() => {
                        setLightboxImages(gallery.media.map((m) => m.url));
                        setLightboxIndex(photoIdx);
                        setLightboxOpen(true);
                      }}
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Simple Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white text-3xl hover:text-gray-300"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            >
              ‹
            </button>
          )}
          <img
            src={lightboxImages[lightboxIndex]}
            alt=""
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {lightboxIndex < lightboxImages.length - 1 && (
            <button
              className="absolute right-4 text-white text-3xl hover:text-gray-300"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
