import { useEffect, useState } from "react";
import api from "../Api/api";
import { HiOutlinePhotograph } from "react-icons/hi";

export default function PMGallery() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/pm/projects");
        setProjects(res.data.data);
        if (res.data.data.length > 0) setSelectedProject(res.data.data[0].id);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) fetchGallery();
  }, [selectedProject]);

  const fetchGallery = async () => {
    try {
      const res = await api.get(`/pm/gallery/${selectedProject}`);
      setGalleries(res.data.data);
    } catch (err) {
      console.error(err);
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
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
        <HiOutlinePhotograph className="text-[#C5A572]" /> Photo Gallery
      </h1>

      {projects.length > 0 && (
        <div className="mb-6">
          <select
            value={selectedProject || ""}
            onChange={(e) => setSelectedProject(parseInt(e.target.value))}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#C5A572]"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {galleries.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <HiOutlinePhotograph className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No gallery photos for this project.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-semibold text-[#1A1A1A] mb-3">{gallery.phase || gallery.name || "Gallery"}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {(gallery.media || []).map((media) => (
                  <div key={media.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={media.url}
                      alt={media.caption || "Photo"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
              {(!gallery.media || gallery.media.length === 0) && (
                <p className="text-sm text-gray-400">No photos in this gallery.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
