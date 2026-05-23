import React from "react";
import { FaRegFileAlt, FaDownload } from "react-icons/fa";

export default function DocumentsSection({ documents = [] }) {
  // Group documents by type for better organization
  const groupedDocuments = documents.reduce((acc, doc) => {
    const type = doc.type || "OTHER";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(doc);
    return acc;
  }, {});

  // Get icon based on document type
  const getDocumentIcon = (type) => {
    switch (type) {
      case "CONTRACT":
        return "📝";
      case "PERMIT":
        return "📋";
      case "BLUEPRINT":
        return "🏗️";
      case "INVOICE":
        return "🧾";
      case "WARRANTY":
        return "🔖";
      default:
        return "📄";
    }
  };

  // Format file type for display
  const formatDocumentType = (type) => {
    return type ? type.replace(/_/g, " ").toLowerCase() : "document";
  };

  if (documents.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Documents</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FaRegFileAlt className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No documents available yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Your project documents will appear here once they are uploaded
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl mb-6">Documents</h2>

      {Object.entries(groupedDocuments).map(([type, docs]) => (
        <div key={type} className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4 capitalize">
            {type.replace(/_/g, " ").toLowerCase()} ({docs.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {docs.map((doc) => (
              <a
                key={doc.id}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 group"
                download
              >
                <div className="relative mb-3">
                  <div className="text-4xl mb-1">
                    {getDocumentIcon(doc.type)}
                  </div>
                  <div className="absolute -top-1 -right-1 bg-blue-100 rounded-full p-1">
                    <FaDownload className="text-blue-600 text-xs" />
                  </div>
                </div>

                <span className="text-sm font-medium text-gray-800 text-center mb-1 group-hover:text-blue-600 transition-colors">
                  {doc.name}
                </span>

                <span className="text-xs text-gray-500 text-center capitalize">
                  {formatDocumentType(doc.type)}
                </span>

                {doc.updatedAt && (
                  <span className="text-xs text-gray-400 mt-2">
                    Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                  </span>
                )}

                {doc.createdAt && !doc.updatedAt && (
                  <span className="text-xs text-gray-400 mt-2">
                    Added: {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      ))}

      {/* Total documents count */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Total documents: {documents.length}
        </p>
      </div>
    </div>
  );
}
