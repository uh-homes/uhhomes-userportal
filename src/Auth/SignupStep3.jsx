import { useState } from "react";
import {
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";
import { loginUser, registerUser } from "../services/authApi";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addUser } from "../store/slice/userSlice";

export const SignupStep3 = ({ userData, email, onClose, setStep }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      const res = await registerUser({ ...userData, email, password });
      toast.success(res.message);
      const user = await loginUser({ email, password });
      dispatch(addUser(user));
      onClose?.();
    } catch (error) {
      console.error("Error setting password:", error);
      toast.error(error?.response?.data?.message || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-[#C5A572]">
        Sign Up
      </p>
      <h2 className="text-3xl font-bold text-center text-white">
        Set your password
      </h2>
      <p className="text-center text-gray-400 mt-1">
        Choose a secure password to finish creating your account.
      </p>
      <form onSubmit={handleSetPassword} className="space-y-4">
        {/* Password */}
        <div className="relative">
          <HiOutlineLockClosed className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full bg-[#111] border border-[#333] text-white placeholder-gray-500 rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] disabled:opacity-60 transition-colors"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#C5A572] cursor-pointer transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <HiOutlineEyeOff className="w-5 h-5" />
            ) : (
              <HiOutlineEye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <HiOutlineLockClosed className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full bg-[#111] border border-[#333] text-white placeholder-gray-500 rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] disabled:opacity-60 transition-colors"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#C5A572] cursor-pointer transition-colors"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <HiOutlineEyeOff className="w-5 h-5" />
            ) : (
              <HiOutlineEye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#C5A572] to-[#D4AF37] text-[#0D0D0D] font-semibold py-2.5 rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-[#0D0D0D]/50 border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Saving..." : "Set Password"}
        </button>
      </form>
      <button
        onClick={() => setStep("login")}
        className="text-sm text-center text-[#C5A572] hover:text-[#D4AF37] w-full cursor-pointer transition-colors"
      >
        Back to login account
      </button>
    </div>
  );
};
