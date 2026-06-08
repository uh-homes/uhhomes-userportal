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
        <h2 className="text-2xl text-white">Reset Password</h2>
        <p className="text-sm text-gray-400 mt-1">
          Create a new password for {email}
        </p>
      </div>

      <div className="relative">
        <HiOutlineLockClosed className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
        <input
          type={show ? "text" : "password"}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          disabled={loading}
          className="w-full bg-[#111] border border-[#333] text-white placeholder-gray-500 rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] disabled:opacity-60 transition-colors"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#C5A572] transition-colors"
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
          className="flex-1 bg-gradient-to-r from-[#C5A572] to-[#D4AF37] text-[#0D0D0D] font-semibold py-2.5 rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-[#0D0D0D]/50 border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Saving..." : "Reset Password"}
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-4 py-2.5 border border-[#333] text-gray-300 rounded-lg hover:bg-[#1a1a1a] disabled:opacity-60 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
