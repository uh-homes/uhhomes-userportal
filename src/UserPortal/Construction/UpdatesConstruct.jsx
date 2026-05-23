import React from "react";
import { Link } from "react-router-dom";

const UpdatesConstruct = ({ updates = [] }) => {
  if (updates.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto p-2 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 mt-4">Updates Feed</h2>
        <p className="text-gray-500">No updates available</p>
      </div>
    );
  }

  // Get the most recent update
  const latestUpdate = updates[0];

  return (
    <div className="w-full max-w-7xl mx-auto p-2 rounded-lg">
      {/* Header */}
      <h2 className="text-xl mb-4 mt-4">Updates Feed</h2>

      {/* Card */}
      <div className="flex flex-col sm:flex-row rounded-lg overflow-hidden bg-white shadow">
        {/* Image - Use first media item if available */}
        {latestUpdate.media && latestUpdate.media.length > 0 && (
          <div className="sm:w-1/3">
            <img
              src={latestUpdate.media[0].url}
              alt={latestUpdate.title}
              className="w-full h-66 object-cover p-2 rounded-xl"
            />
          </div>
        )}

        {/* Content */}
        <div
          className={`p-4 ${
            latestUpdate.media && latestUpdate.media.length > 0
              ? "sm:w-2/3"
              : "w-full"
          } flex flex-col items-center justify-center`}
        >
          <div className="">
            <div>
              <h3 className="text-xl text-gray-900">
                {latestUpdate.title || "Update"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Posted on{" "}
                {new Date(latestUpdate.createdAt).toLocaleDateString()}
                {latestUpdate.milestone && ` - ${latestUpdate.milestone.name}`}
              </p>
              <p className="text-md text-gray-800 mt-4 max-w-lg">
                {latestUpdate.description || "No description available."}
              </p>
            </div>

            {/* Button */}
            {/* {latestUpdate.media && latestUpdate.media.length > 0 && (
              <div className="mt-4">
                <button className="px-4 py-2 bg-gradient text-white rounded-md text-sm font-medium shadow hover:opacity-90 transition">
                  VIEW PHOTOS
                </button>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Show count of additional updates */}
      {updates.length > 1 && (
        <Link to={"/updates"} className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            +{updates.length - 1} more update
            {updates.length - 1 !== 1 ? "s" : ""}
          </p>
        </Link>
      )}
    </div>
  );
};

export default UpdatesConstruct;
