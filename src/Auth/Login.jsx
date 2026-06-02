import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
} from "react-icons/hi";

import { loginUser } from "../services/authApi";
import { addUser } from "../store/slice/userSlice";
import { Slide, toast } from "react-toastify";
export const Login = ({ goToSignup, onClose, goToForgot }) => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const user = await loginUser({ email, password });
      dispatch(addUser(user));
      onClose?.();
      toast.success("Login successful!", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    } catch (error) {
      const fallbackMessage = "Please check your credentials.";
      const errorPayload = error?.response?.data;
      const derivedMessage =
        errorPayload?.message ||
        errorPayload?.error ||
        errorPayload?.data?.message ||
        errorPayload?.data?.error ||
        (Array.isArray(errorPayload?.errors)
          ? errorPayload.errors[0]
          : undefined) ||
        (Array.isArray(errorPayload?.data?.errors)
          ? errorPayload.data.errors[0]
          : undefined) ||
        (typeof errorPayload?.data === "string"
          ? errorPayload.data
          : undefined) ||
        (typeof errorPayload === "string" ? errorPayload : undefined) ||
        error?.message;
      const backendMessage = derivedMessage || fallbackMessage;

      setErrorMessage(backendMessage);
      toast.error(backendMessage, {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Slide,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-4xl text-center text-white">Welcome</h2>
      <p className="text-center text-gray-400 mt-1">
        Please enter your credentials to continue.
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <HiOutlineMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full bg-[#111] border border-[#333] text-white placeholder-gray-500 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] disabled:opacity-60 transition-colors"
          />
        </div>

        <div className="relative">
          <HiOutlineLockClosed className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
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
        <div className="text-right mb-2">
          <button
            type="button"
            onClick={goToForgot}
            disabled={loading}
            className="text-sm text-[#C5A572] hover:text-[#D4AF37] cursor-pointer transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full bg-gradient-to-r from-[#C5A572] to-[#D4AF37] text-[#0D0D0D] font-semibold py-2.5 rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-[#0D0D0D]/50 border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Signing in..." : "Log In"}
        </button>
        {errorMessage && (
          <p className="mt-2 text-sm text-red-400 text-center">
            {errorMessage}
          </p>
        )}
      </form>

      <div className="text-center">
        <button
          onClick={goToSignup}
          disabled={loading}
          className="text-sm text-[#C5A572] hover:text-[#D4AF37] cursor-pointer transition-colors"
        >
          Create an account
        </button>
      </div>

      <div className="text-center border-t border-[#333] pt-4">
        <button
          onClick={() =>
            (window.location.href = `${
              import.meta.env.VITE_API_URL
            }/auth/google`)
          }
          disabled={loading}
          className="w-full border border-[#333] hover:border-[#C5A572] p-2.5 rounded-lg flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60 text-white transition-colors"
        >
          <img
            src="https://res.cloudinary.com/davr2ejkc/image/upload/v1757742819/search_najbxq.png"
            alt="Google"
            className="w-5 h-5"
          />
          Continue With Google Account
        </button>
      </div>
    </div>
  );
};
