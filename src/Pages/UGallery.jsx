import { useEffect, useState } from "react";
import ConstructionGallery from "../UserPortal/Construction/ConstructionGallery";
import api from "../Api/api";

export default function UGallery() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const response = await api.get("/user-projects/tracker");
        setProject(response.data.data);
      } catch (err) {
        setError(err.message || "Failed to fetch gallery data");
        console.error("Error fetching gallery:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C5A572] mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#C5A572] text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <ConstructionGallery gallery={project?.gallery || []} />
    </div>
  );
}
