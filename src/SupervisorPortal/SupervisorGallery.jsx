import { useState, useEffect } from "react";
import api from "../Api/api";
import { HiOutlinePhotograph } from "react-icons/hi";

export default function SupervisorGallery() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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

  useEffect(() => {
    if (!selectedProject) return;
    const fetchGallery = async () => {
      try {
        const res = await api.get(`/supervisor/gallery/${selectedProject.id}`);
        setGalleries(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchGallery();
  }, [selectedProject]);

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

      <div className="mb-6">
        <select
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#C5A572] focus:border-transparent"
          value={selectedProject?.id || ""}
          onChange={(e) => setSelectedProject(projects.find((p) => p.id === parseInt(e.target.value)))}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

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
