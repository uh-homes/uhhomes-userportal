import React, { useState, useEffect, use } from "react";
import { Link, useNavigate } from "react-router";
import { FaArrowLeft, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import api from "../../Api/api";

const UpdatesPage = () => {
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/user-projects/tracker");
        setUpdates(response.data.data.updates || []);
      } catch (err) {
        setError(err.message || "Failed to fetch updates");
        console.error("Error fetching updates:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-lightgreen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-lightgreen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600 py-8">
            <p>Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lightgreen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-800 hover:text-gray-800 mr-4 cursor-pointer"
          >
            <FaArrowLeft className="mr-2" />
            Back to Dashboard
          </div>
          <h1 className="text-2xl text-gray-800">Project Updates</h1>
        </div>

        {/* Updates List */}
        <div className="space-y-6">
          {updates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-800 mb-2">
                No updates found
              </p>
              <p className="text-gray-500">
                No updates or documents available yet.
              </p>
            </div>
          ) : (
            updates.map((update) => (
              <div
                key={update.id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xl font-semibold text-gray-800">
                        {update.title || "Update"}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <FaCalendarAlt className="mr-2" />
                        <span>{formatDate(update.createdAt)}</span>
                        {update.milestone && (
                          <span className="ml-4 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {update.milestone.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {update.description && (
                    <p className="text-gray-800 mb-4 whitespace-pre-wrap">
                      {update.description}
                    </p>
                  )}

                  {/* Media Gallery */}
                  {update.media && update.media.length > 0 && (
                    <div className="mb-4">
                      <p className="font-semibold text-gray-800 mb-2">Media</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {update.media.map((mediaItem) => (
                          <div
                            key={mediaItem.id}
                            className="rounded-lg overflow-hidden border border-gray-200"
                          >
                            <img
                              src={mediaItem.url}
                              alt={mediaItem.type}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Documents */}
                  {update.url && (
                    <div className="mt-4">
                      <a
                        href={update.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FaFileAlt className="mr-2" />
                        View Document
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;
