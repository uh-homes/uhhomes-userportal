import { useState } from "react";
import { resetPassword } from "../../services/authApi";
import {
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import { Slide, toast } from "react-toastify";

export default function ResetPasswordForm({ email, otp, onBack, onDone }) {
  const [newPassword, setNewPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword) return;
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      toast.success("Password reset successful", {
        position: "top-center",
        autoClose: 1200,
        hideProgressBar: true,
        theme: "light",
        transition: Slide,
      });
      onDone?.();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to reset password",
        {
          position: "top-center",
          autoClose: 1500,
          hideProgressBar: true,
          theme: "light",
          transition: Slide,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl">Reset Password</h2>
        <p className="text-sm text-gray-800 mt-1">
          Create a new password for {email}
        </p>
      </div>

      <div className="relative">
        <HiOutlineLockClosed className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type={show ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          disabled={loading}
          className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          onClick={() => setShow((v) => !v)}
        >
          {show ? (
            <HiOutlineEyeOff className="w-5 h-5" />
          ) : (
            <HiOutlineEye className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          disabled={loading || !newPassword}
          className="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Saving..." : "Reset Password"}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-60"
        >
          Back
        </button>
      </div>
    </div>
  );
}
