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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline - Left */}
        <div>
          <ConstructionTimeline milestones={project.milestones} />
        </div>

        {/* Site Updates - Right */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCalendarDay className="text-[#C5A572]" />
              Site Updates
            </h2>
            {project.updates?.length > 0 ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {Object.entries(groupedUpdates).map(([date, updates]) => (
                  <div key={date}>
                    <p className="text-[11px] font-semibold text-[#C5A572] uppercase tracking-wide mb-2">{date}</p>
                    <div className="space-y-3 border-l-2 border-[#C5A572]/20 pl-3">
                      {updates.map((update) => (
                        <div key={update.id} className="pb-2">
                          <p className="text-[13px] font-medium text-gray-900">{update.title}</p>
                          {update.description && (
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-3">{update.description}</p>
                          )}
                          <span className="text-[10px] text-gray-400 mt-1 block">
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
            ) : (
              <p className="text-xs text-gray-400">No site updates yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
