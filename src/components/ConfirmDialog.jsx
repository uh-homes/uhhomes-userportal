import React from "react";
import { HiOutlineExclamation, HiOutlineX } from "react-icons/hi";

export default function ConfirmDialog({
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${danger ? "bg-red-50 text-red-500" : "bg-[#FAF7F2] text-[#C5A572]"}`}>
              <HiOutlineExclamation className="text-xl" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1A1A]">{title}</h3>
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <HiOutlineX className="text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
              danger ? "bg-red-500 hover:bg-red-600" : "bg-[#C5A572] hover:bg-[#b39362]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
