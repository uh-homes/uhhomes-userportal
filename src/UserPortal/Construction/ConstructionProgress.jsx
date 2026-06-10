import React from "react";
import {
  FaHardHat,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import { HiOutlineLocationMarker, HiOutlineCalendar } from "react-icons/hi";

const ConstructionProgress = ({ project }) => {
  const milestones = project?.milestones || [];

  const completedCount = milestones.filter((m) => m.status === "COMPLETE").length;
  const inProgressCount = milestones.filter((m) => m.status === "IN_PROGRESS").length;
  const delayedCount = milestones.filter((m) => m.status === "DELAYED").length;
  const plannedCount = milestones.filter((m) => m.status === "PLANNED").length;
  const totalCount = milestones.length;

  const completionPercent = project?.completionPercentage || (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

  // Find the current milestone
  const currentMilestone = milestones.find(
    (m) => m.status === "IN_PROGRESS" || m.status === "DELAYED"
  ) || milestones.find((m) => m.status === "PLANNED");

  return (
    <div className="w-full max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg mt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {project?.name || "My Project"}
          </h2>
          {project?.address && (
            <div className="flex items-center gap-1.5 text-sm mt-1">
              <HiOutlineLocationMarker className="text-[#C5A572]" />
              <span className="font-semibold text-gray-800">{project.address}</span>
            </div>
          )}
        </div>
        <div className="mt-3 md:mt-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              project?.status === "COMPLETED"
                ? "bg-green-100 text-green-700"
                : project?.status === "IN_PROGRESS"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {project?.status?.replace("_", " ") || "In Progress"}
          </span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-gray-800">{completionPercent}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <FaCheckCircle className="text-green-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-green-700">{completedCount}</p>
          <p className="text-xs text-green-600">Completed</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <FaHardHat className="text-blue-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-blue-700">{inProgressCount}</p>
          <p className="text-xs text-blue-600">In Progress</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <FaExclamationTriangle className="text-red-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-red-700">{delayedCount}</p>
          <p className="text-xs text-red-600">Delayed</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <FaClock className="text-gray-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-700">{plannedCount}</p>
          <p className="text-xs text-gray-600">Planned</p>
        </div>
      </div>

      {/* Current Milestone */}
      {currentMilestone && (
        <div className="border border-blue-100 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium mb-1">CURRENT MILESTONE</p>
              <p className="text-sm font-semibold text-gray-800">{currentMilestone.name}</p>
              {currentMilestone.description && (
                <p className="text-xs text-gray-600 mt-1">{currentMilestone.description}</p>
              )}
            </div>
            <div className="text-right">
              {currentMilestone.date && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <HiOutlineCalendar />
                  {new Date(currentMilestone.date).toLocaleDateString()}
                </div>
              )}
              {currentMilestone.progress !== undefined && currentMilestone.progress > 0 && (
                <p className="text-sm font-bold text-blue-600 mt-1">{currentMilestone.progress}%</p>
              )}
            </div>
          </div>
          {currentMilestone.progress !== undefined && currentMilestone.progress > 0 && (
            <div className="mt-3">
              <div className="w-full bg-blue-100 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${currentMilestone.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Milestones List (compact) */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Milestones Overview</h3>
        <div className="space-y-2">
          {milestones.map((milestone, index) => {
            const isComplete = milestone.status === "COMPLETE";
            const isInProgress = milestone.status === "IN_PROGRESS";
            const isDelayed = milestone.status === "DELAYED";

            return (
              <div
                key={milestone.id || index}
                className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Status dot */}
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    isComplete
                      ? "bg-green-500"
                      : isInProgress
                      ? "bg-blue-500"
                      : isDelayed
                      ? "bg-red-500"
                      : "bg-gray-300"
                  }`}
                ></div>

                {/* Name */}
                <span
                  className={`text-sm flex-1 ${
                    isComplete ? "text-gray-500 line-through" : "text-gray-800"
                  }`}
                >
                  {milestone.name}
                </span>

                {/* Date */}
                {milestone.date && (
                  <span className="text-xs text-gray-400">
                    {new Date(milestone.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}

                {/* Status badge */}
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isComplete
                      ? "bg-green-100 text-green-600"
                      : isInProgress
                      ? "bg-blue-100 text-blue-600"
                      : isDelayed
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isComplete
                    ? "Done"
                    : isInProgress
                    ? "Active"
                    : isDelayed
                    ? "Delayed"
                    : "Planned"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ConstructionProgress;
