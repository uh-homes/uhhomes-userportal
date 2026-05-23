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
      <h2 className="text-4xl text-center">Welcome</h2>
      <p className="text-center text-gray-800 mt-1">
        Please enter your credentials to continue.
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="relative">
          <HiOutlineMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full border rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          />
        </div>

        <div className="relative">
          <HiOutlineLockClosed className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="w-full border rounded pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
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
            className="text-sm text-primary cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          className="w-full bg-primary text-white py-2 rounded hover:bg-opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Signing in..." : "Log In"}
        </button>
        {errorMessage && (
          <p className="mt-2 text-sm text-red-600 text-center">
            {errorMessage}
          </p>
        )}
      </form>

      <div className="text-center">
        <button
          onClick={goToSignup}
          disabled={loading}
          className="text-sm text-primary cursor-pointer"
        >
          Create an account
        </button>
      </div>

      <div className="text-center border-t pt-4">
        <button
          onClick={() =>
            (window.location.href = `${
              import.meta.env.VITE_API_URL
            }/auth/google`)
          }
          disabled={loading}
          className="w-full border p-2 rounded flex justify-center items-center gap-2 cursor-pointer disabled:opacity-60"
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
