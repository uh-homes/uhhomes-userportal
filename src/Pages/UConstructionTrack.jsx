import { useEffect, useState } from "react";
import ConstructionProgress from "../UserPortal/Construction/ConstructionProgress";
import UpdatesConstruct from "../UserPortal/Construction/UpdatesConstruct";
import ConstructionGallery from "../UserPortal/Construction/ConstructionGallery";
import api from "../Api/api";

export default function UConstructionTrack() {
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
        setError(err.message || "Failed to fetch project data");
        console.error("Error fetching construction tracker:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 rounded-lg bg-lightgreen min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading construction tracker...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 rounded-lg bg-lightgreen min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 rounded-lg bg-lightgreen min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-800">No project data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 rounded-lg bg-lightgreen">
      <div>
        <ConstructionProgress project={project} />
        <UpdatesConstruct updates={project.updates} />
        <ConstructionGallery gallery={project.gallery} />
      </div>
    </div>
  );
}
