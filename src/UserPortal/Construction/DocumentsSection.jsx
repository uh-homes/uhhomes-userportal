import React from "react";
import { FaRegFileAlt, FaDownload, FaShieldAlt, FaCertificate } from "react-icons/fa";

export default function DocumentsSection({ documents = [], warranties = [] }) {
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

  if (documents.length === 0 && warranties.length === 0) {
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

      {/* Warranties & Certificates Section */}
      {warranties.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl mb-6">Warranties & Certificates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {warranties.map((w) => {
              const isExpired = w.expiryDate && new Date(w.expiryDate) < new Date();
              const isCertificate = w.type === "COMPLETION_CERTIFICATE";
              return (
                <a
                  key={w.id}
                  href={w.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 group"
                  download
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isCertificate ? "bg-blue-50" : "bg-green-50"
                    }`}>
                      {isCertificate ? (
                        <FaCertificate className="text-blue-600 text-lg" />
                      ) : (
                        <FaShieldAlt className="text-green-600 text-lg" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors block truncate">
                        {w.name}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full inline-block mt-1 ${
                        isCertificate ? "bg-blue-100 text-blue-700" :
                        isExpired ? "bg-red-100 text-red-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {isCertificate ? "Certificate" : isExpired ? "Expired" : "Active Warranty"}
                      </span>
                    </div>
                  </div>

                  {w.warrantyType && (
                    <p className="text-xs text-gray-500 mb-1">Type: {w.warrantyType}</p>
                  )}
                  {w.description && (
                    <p className="text-xs text-gray-400 mb-2 line-clamp-2">{w.description}</p>
                  )}

                  <div className="mt-auto pt-2 border-t border-gray-100 space-y-1">
                    <p className="text-xs text-gray-500">
                      Issued: {new Date(w.issueDate).toLocaleDateString()}
                    </p>
                    {w.expiryDate && (
                      <p className={`text-xs ${isExpired ? "text-red-500 font-medium" : "text-gray-500"}`}>
                        {isExpired ? "Expired" : "Valid until"}: {new Date(w.expiryDate).toLocaleDateString()}
                      </p>
                    )}
                    {!w.expiryDate && !isCertificate && (
                      <p className="text-xs text-green-600">Lifetime Warranty</p>
                    )}
                    {w.validityMonths && (
                      <p className="text-xs text-gray-400">({w.validityMonths} months coverage)</p>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
