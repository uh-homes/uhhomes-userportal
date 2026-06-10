import React from "react";
import { FaCheckCircle, FaHardHat, FaClock } from "react-icons/fa";

const ConstructionTimeline = ({ milestones = [] }) => {
  const sorted = [...milestones].sort((a, b) => (a.order || 0) - (b.order || 0));

  const completedCount = sorted.filter((m) => m.status === "COMPLETE").length;
  const currentMilestone = sorted.find((m) => m.status === "IN_PROGRESS");
  const overallProgress = sorted.length > 0 ? Math.round((completedCount / sorted.length) * 100) : 0;

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Construction Timeline</h2>
        <div className="text-center py-8">
          <FaHardHat className="text-3xl text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No milestones available</p>
          <p className="text-xs text-gray-400 mt-1">
            Construction milestones will appear here once they are scheduled
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-gray-900">Construction Timeline</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            {completedCount} of {sorted.length} complete
          </span>
          <span className="text-xs font-medium text-[#C5A572]">{overallProgress}%</span>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-[#C5A572] to-[#D4AF37] transition-all"
          style={{ width: `${overallProgress}%` }}
        />
      </div>

      {/* Vertical Timeline */}
      <div className="relative ml-4">
        {sorted.map((milestone, idx) => {
          const isComplete = milestone.status === "COMPLETE";
          const isInProgress = milestone.status === "IN_PROGRESS";
          const isLast = idx === sorted.length - 1;

          return (
            <div key={milestone.id || idx} className="relative pl-8 pb-6 last:pb-0">
              {/* Connector line */}
              {!isLast && (
                <div className={`absolute left-[7px] top-4 w-0.5 h-full ${isComplete ? "bg-[#C5A572]" : "bg-gray-200"}`}></div>
              )}

              {/* Node dot */}
              <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                isComplete ? "bg-[#C5A572] border-[#C5A572]" :
                isInProgress ? "bg-white border-[#C5A572]" :
                "bg-white border-gray-300"
              }`}>
                {isComplete && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isComplete || isInProgress ? "text-gray-900" : "text-gray-400"}`}>
                    {milestone.name}
                  </p>
                  {milestone.description && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{milestone.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      isComplete ? "bg-green-50 text-green-700" :
                      isInProgress ? "bg-blue-50 text-blue-700" :
                      "bg-gray-50 text-gray-500"
                    }`}>
                      {isComplete ? "Complete" : isInProgress ? "In Progress" : "Planned"}
                    </span>
                    {milestone.date && (
                      <span className="text-[11px] text-gray-400">
                        {new Date(milestone.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress indicator for in-progress milestones */}
                {isInProgress && milestone.progress !== undefined && (
                  <div className="text-right ml-4">
                    <span className="text-xs font-medium text-[#C5A572]">{milestone.progress}%</span>
                    <div className="w-16 bg-gray-100 rounded-full h-1.5 mt-1">
                      <div
                        className="h-1.5 rounded-full bg-[#C5A572] transition-all"
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer summary */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {currentMilestone ? (
            <>
              <FaHardHat className="text-xs text-[#C5A572]" />
              <span className="text-xs text-gray-600">Current: <span className="font-medium text-gray-800">{currentMilestone.name}</span></span>
            </>
          ) : completedCount === sorted.length ? (
            <>
              <FaCheckCircle className="text-xs text-green-500" />
              <span className="text-xs text-gray-600 font-medium">All milestones completed</span>
            </>
          ) : (
            <>
              <FaClock className="text-xs text-gray-400" />
              <span className="text-xs text-gray-500">Timeline not started</span>
            </>
          )}
        </div>
        <span className="text-[11px] text-gray-400">Updated {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default ConstructionTimeline;
