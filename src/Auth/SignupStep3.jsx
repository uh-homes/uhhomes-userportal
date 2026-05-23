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
      <h2 className="text-2xl font-bold text-center">Sign Up</h2>
      <h2 className="text-4xl text-center">Welcome</h2>
      <p className="text-center text-gray-800 mt-1">
        Your home journey made simple — live progress tracking, milestone
        updates, and timelines all in one place.
      </p>
      <form onSubmit={handleSetPassword} className="space-y-4">
        {/* Password */}
        <div className="relative">
          <HiOutlineLockClosed className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-800 cursor-pointer"
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
          <HiOutlineLockClosed className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-800 cursor-pointer"
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
          className="w-full bg-primary text-white py-2 rounded hover:bg-opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Saving..." : "Set Password"}
        </button>
      </form>
      <button
        onClick={() => setStep("login")}
        className="text-sm text-center text-primary w-full cursor-pointer"
      >
        Back to login account
      </button>
    </div>
  );
};
