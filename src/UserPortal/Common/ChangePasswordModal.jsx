import React, { useState } from "react";
import {
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import { changePassword } from "../../services/authApi";

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleToggle = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const resetState = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswords({ current: false, next: false, confirm: false });
    setError("");
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose?.();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Please complete all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }

    if (newPassword === oldPassword) {
      setError("New password must be different from the current password");
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword(oldPassword, newPassword);
      const message = response?.message || "Password updated successfully";
      onSuccess?.(message);
      resetState();
      onClose?.();
    } catch (err) {
      const apiMessage =
        err?.response?.data?.message || "Unable to update password";
      setError(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close change password modal"
        >
          &times;
        </button>

        <h2 className="text-xl text-gray-900">Change Password</h2>
        <p className="text-sm text-gray-600 mt-1">
          Update your account with a new, secure password.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPasswords.current ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Current password"
              className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-10 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => handleToggle("current")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showPasswords.current ? (
                <HiOutlineEyeOff className="h-5 w-5" />
              ) : (
                <HiOutlineEye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPasswords.next ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-10 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => handleToggle("next")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showPasswords.next ? (
                <HiOutlineEyeOff className="h-5 w-5" />
              ) : (
                <HiOutlineEye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="relative">
            <HiOutlineLockClosed className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPasswords.confirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full rounded-md border border-gray-200 py-2 pl-10 pr-10 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => handleToggle("confirm")}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showPasswords.confirm ? (
                <HiOutlineEyeOff className="h-5 w-5" />
              ) : (
                <HiOutlineEye className="h-5 w-5" />
              )}
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-md bg-green-600 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Saving..." : "Update Password"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
