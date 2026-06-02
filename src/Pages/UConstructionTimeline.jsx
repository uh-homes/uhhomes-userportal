import React from "react";
import ConstructionTimeline from "../UserPortal/Common/ConstructionTimeline";
import useProject from "../hooks/useProject";

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
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        <p>No construction timeline data available.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Construction Timeline</h1>
      <ConstructionTimeline milestones={project.milestones} />
    </div>
  );
}
