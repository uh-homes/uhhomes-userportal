import React from "react";
import { LuBellPlus } from "react-icons/lu";

const AlertsDigest = ({ project = {} }) => {
  // Generate alerts based on project data
  const generateAlerts = () => {
    const alerts = [];
    const now = new Date();

    // Add alert for project status
    if (project.status) {
      alerts.push({
        message: `Project status changed to ${project.status
          .replace("_", " ")
          .toLowerCase()}`,
        time: "Recently",
        type: "status",
      });
    }

    // Add alerts for new documents
    if (project.documents && project.documents.length > 0) {
      // Get the most recent document
      const recentDoc = project.documents.reduce((latest, doc) => {
        return new Date(doc.createdAt) > new Date(latest.createdAt)
          ? doc
          : latest;
      }, project.documents[0]);

      // Check if document was added recently (within last 7 days)
      const docDate = new Date(recentDoc.createdAt);
      const daysDiff = Math.floor((now - docDate) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 7) {
        let timeText;
        if (daysDiff === 0) timeText = "Today";
        else if (daysDiff === 1) timeText = "1 day ago";
        else timeText = `${daysDiff} days ago`;

        alerts.push({
          message: `New document uploaded: ${recentDoc.name}`,
          time: timeText,
          type: "document",
        });
      }
    }

    // Add alerts for milestone progress
    if (project.milestones && project.milestones.length > 0) {
      const inProgressMilestones = project.milestones.filter(
        (m) => m.status === "IN_PROGRESS"
      );

      if (inProgressMilestones.length > 0) {
        alerts.push({
          message: `${inProgressMilestones.length} milestone(s) in progress`,
          time: "Ongoing",
          type: "milestone",
        });
      }

      // Check for recently completed milestones
      const recentCompleted = project.milestones.filter((m) => {
        if (m.status === "COMPLETED" && m.updatedAt) {
          const completedDate = new Date(m.updatedAt);
          const daysDiff = Math.floor(
            (now - completedDate) / (1000 * 60 * 60 * 24)
          );
          return daysDiff <= 7;
        }
        return false;
      });

      if (recentCompleted.length > 0) {
        alerts.push({
          message: `${recentCompleted.length} milestone(s) recently completed`,
          time: "This week",
          type: "completion",
        });
      }
    }

    // Add alert for project progress
    if (project.progress !== undefined) {
      alerts.push({
        message: `Construction progress: ${project.progress}% complete`,
        time: "Current",
        type: "progress",
      });
    }

    // If no alerts generated, add a default message
    if (alerts.length === 0) {
      alerts.push({
        message: "No recent alerts",
        time: "Now",
        type: "info",
      });
    }

    return alerts.slice(0, 5); // Return max 5 alerts
  };

  const alerts = generateAlerts();

  return (
    <div className="w-full max-w-7xl mx-auto p-4 rounded-lg mt-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <LuBellPlus className="text-teal-600 text-xl" />
        <h2 className="text-xl">Alerts Digest</h2>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm"
          >
            {/* Left side */}
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  alert.type === "status"
                    ? "bg-blue-600"
                    : alert.type === "document"
                    ? "bg-teal-600"
                    : alert.type === "milestone"
                    ? "bg-yellow-600"
                    : alert.type === "completion"
                    ? "bg-green-600"
                    : alert.type === "progress"
                    ? "bg-purple-600"
                    : "bg-gray-600"
                }`}
              ></span>
              <p className="text-gray-800 font-semibold">{alert.message}</p>
            </div>
            {/* Right side */}
            <span className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-0">
              {alert.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertsDigest;
