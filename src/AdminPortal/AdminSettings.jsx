import React from "react";
import { useSelector } from "react-redux";

export default function AdminSettings() {
  const user = useSelector((state) => state?.user);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Admin Settings</h1>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-2xl">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Name</label>
            <p className="text-[#1A1A1A] font-medium">{user?.fullName || "Admin User"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <p className="text-[#1A1A1A] font-medium">{user?.email || "admin@uhhomes.com"}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Role</label>
            <span className="bg-[#C5A572] text-white text-xs px-3 py-1 rounded-full">Administrator</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 max-w-2xl mt-6">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">System</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p><strong>Platform:</strong> UHHomes Admin Portal</p>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Support:</strong> sales@uhhomes.com</p>
        </div>
      </div>
    </div>
  );
}
