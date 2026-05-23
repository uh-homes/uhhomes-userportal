import React from "react";
import {
  FaHardHat,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaCalendarAlt,
} from "react-icons/fa";

const ConstructionTimeline = ({ milestones = [] }) => {
  // Get status order for progression
  const getStatusOrder = (status) => {
    switch (status) {
      case "COMPLETE":
        return 4;
      case "DELAYED":
        return 3;
      case "IN_PROGRESS":
        return 2;
      case "PLANNED":
        return 1;
      default:
        return 0;
    }
  };

  // Find the current active step based on status progression
  const getCurrentStepIndex = () => {
    if (milestones.length === 0) return 0;

    // Find the highest completed milestone
    let highestCompletedIndex = -1;

    for (let i = 0; i < milestones.length; i++) {
      if (milestones[i].status === "COMPLETE") {
        highestCompletedIndex = i;
      } else if (
        milestones[i].status === "DELAYED" ||
        milestones[i].status === "IN_PROGRESS"
      ) {
        return i; // Return the first delayed or in-progress milestone
      } else if (
        milestones[i].status === "PLANNED" &&
        highestCompletedIndex === i - 1
      ) {
        return i; // Return the first planned milestone after completed ones
      }
    }

    // If all are complete, return the last index
    if (highestCompletedIndex === milestones.length - 1) {
      return milestones.length - 1;
    }

    // Default to first milestone
    return 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  // Get status icon and color
  const getStatusProperties = (status) => {
    switch (status) {
      case "COMPLETE":
        return {
          icon: <FaCheckCircle className="text-green-500" />,
          color: "bg-green-500",
          textColor: "text-green-800",
          bgColor: "bg-green-100",
          text: "Complete",
        };
      case "DELAYED":
        return {
          icon: <FaExclamationTriangle className="text-red-500" />,
          color: "bg-red-500",
          textColor: "text-red-800",
          bgColor: "bg-red-100",
          text: "Delayed",
        };
      case "IN_PROGRESS":
        return {
          icon: <FaHardHat className="text-blue-500" />,
          color: "bg-blue-500",
          textColor: "text-blue-800",
          bgColor: "bg-blue-100",
          text: "In Progress",
        };
      case "PLANNED":
        return {
          icon: <FaClock className="text-gray-500" />,
          color: "bg-gray-300",
          textColor: "text-gray-800",
          bgColor: "bg-gray-100",
          text: "Planned",
        };
      default:
        return {
          icon: <FaClock className="text-gray-400" />,
          color: "bg-gray-300",
          textColor: "text-gray-800",
          bgColor: "bg-gray-100",
          text: "Unknown",
        };
    }
  };

  if (milestones.length === 0) {
    return (
      <div className="w-full max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg mt-8">
        <h2 className="text-xl text-gray-800 mb-6">Construction Timeline</h2>
        <div className="text-center py-8">
          <FaHardHat className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No milestones available</p>
          <p className="text-sm text-gray-400 mt-2">
            Construction milestones will appear here once they are scheduled
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg mt-8">
      <h2 className="text-xl text-gray-800 mb-6">Construction Timeline</h2>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-0 w-full h-1.5 bg-gray-200 -translate-y-1/2 z-0" />
        <div
          className="absolute top-8 left-0 h-1.5 bg-gradient -translate-y-1/2 z-0 transition-all duration-500 rounded-full"
          style={{
            width:
              milestones.length > 1
                ? `${(currentStepIndex / (milestones.length - 1)) * 100}%`
                : "0%",
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {milestones.map((milestone, index) => {
            const statusProps = getStatusProperties(milestone.status);
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <div
                key={milestone.id || index}
                className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                  isCurrent
                    ? "border-blue-200 bg-blue-50 shadow-md transform -translate-y-1"
                    : isActive
                    ? "border-green-100 bg-green-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${statusProps.color} mr-2`}
                    ></div>
                    <span
                      className={`text-xs font-medium ${statusProps.textColor}`}
                    >
                      {statusProps.text}
                    </span>
                  </div>
                  <div className="text-lg">{statusProps.icon}</div>
                </div>

                {/* Milestone Name */}
                <p
                  className={`font-semibold mb-2 ${
                    isCurrent ? "text-blue-800" : "text-gray-800"
                  }`}
                >
                  {milestone.name}
                </p>

                {/* Date */}
                {milestone.date && (
                  <div className="flex items-center text-sm text-gray-800 mb-3">
                    <FaCalendarAlt className="mr-2 text-gray-400" />
                    <span>{new Date(milestone.date).toLocaleDateString()}</span>
                  </div>
                )}

                {/* Description */}
                {milestone.description && (
                  <p className="text-sm text-gray-800 line-clamp-2">
                    {milestone.description}
                  </p>
                )}

                {/* Progress percentage for in-progress items */}
                {milestone.status === "IN_PROGRESS" &&
                  milestone.progress !== undefined && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-800 mb-1">
                        <span>Progress</span>
                        <span>{milestone.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${milestone.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                {/* Current step indicator */}
                {isCurrent && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Current
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-gray-800 mr-4">
              {currentStepIndex + 1} of {milestones.length} milestones
            </span>
            <div className="flex items-center space-x-2">
              {getStatusProperties(milestones[currentStepIndex]?.status).icon}
              <span className="text-sm font-medium">
                {milestones[currentStepIndex]?.status === "COMPLETE"
                  ? "All milestones completed"
                  : `Current: ${milestones[currentStepIndex]?.name}`}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            Updated {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstructionTimeline;
