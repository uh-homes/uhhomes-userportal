import React from "react";
import { FaCalendarDay } from "react-icons/fa";
import ConstructionTimeline from "../UserPortal/Common/ConstructionTimeline";
import useProject from "../hooks/useProject";
import EmptyState from "../Components/EmptyState";

export default function UConstructionTimeline() {
  const { project, loading, error } = useProject();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-red-500">
        <p>Error loading timeline data.</p>
      </div>
    );
  }

  if (!project || !project.milestones?.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon="timeline"
          title="Timeline Coming Soon"
          message="Your construction timeline will appear here once milestones are scheduled by your project team."
        />
      </div>
    );
  }

  // Group updates by date
  const groupedUpdates = {};
  if (project.updates?.length > 0) {
    project.updates.forEach((update) => {
      const dateKey = new Date(update.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      if (!groupedUpdates[dateKey]) groupedUpdates[dateKey] = [];
      groupedUpdates[dateKey].push(update);
    });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Construction Timeline</h1>
      <ConstructionTimeline milestones={project.milestones} />

      {/* Site Updates */}
      {project.updates?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaCalendarDay className="text-[#C5A572]" />
            Daily Site Updates
          </h2>
          <div className="space-y-5">
            {Object.entries(groupedUpdates).map(([date, updates]) => (
              <div key={date}>
                <p className="text-xs font-medium text-[#C5A572] mb-2">{date}</p>
                <div className="space-y-3 ml-3 border-l-2 border-gray-100 pl-4">
                  {updates.map((update) => (
                    <div key={update.id}>
                      <p className="text-sm font-medium text-gray-900">{update.title}</p>
                      {update.description && (
                        <p className="text-[13px] text-gray-600 mt-0.5">{update.description}</p>
                      )}
                      <span className="text-[11px] text-gray-400">
                        {new Date(update.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
