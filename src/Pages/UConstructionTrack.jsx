import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineMail, HiOutlineArrowRight } from "react-icons/hi";
import ConstructionProgress from "../UserPortal/Construction/ConstructionProgress";
import UpdatesConstruct from "../UserPortal/Construction/UpdatesConstruct";
import ConstructionGallery from "../UserPortal/Construction/ConstructionGallery";
import DocumentsSection from "../UserPortal/Construction/DocumentsSection";
import api from "../Api/api";

export default function UConstructionTrack() {
  const navigate = useNavigate();
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

        {/* Inquiry CTA Card */}
        <div className="my-6 border border-gray-200 rounded-lg bg-white shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <HiOutlineMail className="text-xl text-green-600" />
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-800">Have a Question?</h3>
                <p className="text-sm text-gray-500">Ask UH Homes anything about your project</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/inbox", { state: { compose: true, projectId: project.id } })}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient text-white rounded-lg font-medium hover:opacity-90 transition text-sm"
            >
              Go to Inbox
              <HiOutlineArrowRight />
            </button>
          </div>
        </div>

        <DocumentsSection documents={project.documents} />
      </div>
    </div>
  );
}
