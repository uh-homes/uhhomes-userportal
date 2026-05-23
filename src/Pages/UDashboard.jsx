import ConstructionTimeline from "../UserPortal/Common/ConstructionTimeline";
import AlertsDigest from "../UserPortal/Common/AlertsDigest";
import useProject from "../hooks/useProject";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UDashboard() {
  const { project, error, isLoading, getProject } = useProject();

  const navigate = useNavigate();

  // Get status display properties
  const getStatusProperties = (status) => {
    switch (status) {
      case "ON_TRACK":
        return { color: "bg-green-600", text: "On Track" };
      case "DELAYED":
        return { color: "bg-red-600", text: "Delayed" };
      case "BEHIND_SCHEDULE":
        return { color: "bg-yellow-600", text: "Behind Schedule" };
      case "COMPLETED":
        return { color: "bg-blue-600", text: "Completed" };
      default:
        return { color: "bg-gray-600", text: "Unknown Status" };
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex bg-lightgreen min-h-screen">
        <div className="flex-1 p-6 transition-all">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-800">
                Loading your project dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex bg-lightgreen min-h-screen">
        <div className="flex-1 p-6 transition-all">
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-red-600">
              <p className="mb-4">Error loading project data</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no project
  if (!project) {
    return (
      <div className="flex bg-lightgreen min-h-screen">
        <div className="flex-1 p-6 transition-all">
          <div className="flex items-center justify-center h-full">
            <div className="text-center bg-white p-8 rounded-xl shadow-md w-96">
              <h2 className="text-2xl text-gray-800">No Project Available</h2>
              <p className="text-sm text-gray-500 mt-4">
                It seems you don't have any active project at the moment. If you
                think this is an error, please contact support for assistance.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2 bg-gradient text-white rounded-lg  transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusProps = getStatusProperties(project.status);

  // Calculate progress percentage for the completion circle
  const progressPercentage = project.progress || 0;
  const circumference = 2 * Math.PI * 45; // r = 45% (from the circle radius)
  const strokeDashoffset =
    circumference - (progressPercentage / 100) * circumference;

  // Get project image - use property thumbnail or first gallery image
  const projectImage =
    project.property?.thumbnail ||
    (project.gallery &&
      project.gallery.length > 0 &&
      project.gallery[0].media?.[0]?.url) ||
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";

  return (
    <div className="flex bg-lightgreen">
      {/* Sidebar */}

      {/* Main Content */}
      <div className="flex-1 p-6 transition-all">
        {/* Project Section */}
        <div className="w-full">
          <div className="bg-white md:flex p-5 rounded-xl shadow items-center">
            <div className="lg:w-[40%]">
              <h2 className="text-lg mb-2">
                {project.property?.name || "Property Name"}
              </h2>
              <p className="text-sm text-gray-500">
                {project.address ||
                  project.property?.location ||
                  "Location not specified"}
              </p>

              <div className="flex">
                <div className="gap-3 border-1 border-gray-400 font-semibold text-slate-600 px-2 py-1 rounded-sm text-xs mt-2 flex">
                  <div
                    className={`${statusProps.color} w-2 h-2 rounded-full mt-1`}
                  ></div>
                  <span>{statusProps.text}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/userconstruction")}
                className="bg-gradient text-white px-4 py-2 rounded-lg mt-6 mb-4 text-sm hover:opacity-90 transition-opacity"
              >
                View Construction
              </button>
            </div>
            <div className="lg:w-[60%] lg:pl-6">
              <img
                src={projectImage}
                alt="project"
                className="rounded-lg aspect-[3/1.6] w-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c";
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Latest Update Section */}
          <div className="bg-white p-5 rounded-xl shadow flex flex-col justify-between">
            <div>
              <h2 className="font-base text-lg mb-2">Latest Update</h2>
              {project.updates && project.updates.length > 0 ? (
                <>
                  <p className="text-md font-meduim">
                    {project.updates[0].title || "Project Update"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Posted on{" "}
                    {new Date(
                      project.updates[0].createdAt
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-md text-gray-800 mt-2 line-clamp-3">
                    {project.updates[0].description ||
                      "No description available."}
                  </p>
                </>
              ) : project.documents && project.documents.length > 0 ? (
                <>
                  <h3 className="text-md font-semibold">
                    {project.documents[0].name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Uploaded on{" "}
                    {new Date(
                      project.documents[0].createdAt
                    ).toLocaleDateString()}
                  </p>
                  <p className="text-md text-gray-800 mt-2">
                    Document available for review.
                  </p>
                </>
              ) : (
                <p className="text-gray-500">No updates available</p>
              )}
            </div>
            <button
              onClick={() => navigate("/updates")}
              className="bg-gradient text-white px-4 py-2 rounded-lg text-sm font-semibold mt-4 inline-block self-start hover:opacity-90 transition-opacity"
            >
              View All Updates
            </button>
          </div>

          {/* Completion Section */}
          <div className="bg-white p-5 rounded-xl shadow w-65 h-65 text-center">
            <h2 className=" text-lg">Completion</h2>
            <div className="relative w-full flex justify-center items-center">
              <svg className="w-full h-full max-w-[140px] max-h-[140px] mt-4">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="#22c55e"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)" // Rotate to start from top
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-semibold text-lg">
                {progressPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Construction Timeline - Pass milestones data */}
        <ConstructionTimeline milestones={project.milestones || []} />

        {/* AlertsDigest - Pass relevant data */}
        <AlertsDigest project={project} />
      </div>
    </div>
  );
}
