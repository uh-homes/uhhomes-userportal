import { useState } from "react";
import { HiOutlineUser, HiOutlinePhone, HiOutlineMail } from "react-icons/hi";
import { sendSignUpOTP } from "../services/authApi";
import { toast } from "react-toastify";
export const SignupStep1 = ({ setStep, setEmail, setUserData }) => {
  const [fullName, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, updateEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      setLoading(true);
      setEmail(email);
      setUserData({ fullName, phone });
      const res = await sendSignUpOTP(email, phone);
      toast.success(res.message);
      setStep("signup-2");
    } catch (error) {
      console.error("Error sending OTP:", error);
      const fallbackMessage = "Failed to send OTP";
      const errorPayload = error?.response?.data;
      const derivedMessage =
        errorPayload?.message ||
        errorPayload?.error ||
        errorPayload?.data?.message ||
        errorPayload?.data?.error ||
        (Array.isArray(errorPayload?.errors) ? errorPayload.errors[0] : undefined) ||
        (Array.isArray(errorPayload?.data?.errors)
          ? errorPayload.data.errors[0]
          : undefined) ||
        (typeof errorPayload?.data === "string" ? errorPayload.data : undefined) ||
        (typeof errorPayload === "string" ? errorPayload : undefined) ||
        error?.message;
      const backendMessage = derivedMessage || fallbackMessage;

      setErrorMessage(backendMessage);
      toast.error(backendMessage);
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
        Create your account
      </h2>
      <p className="text-center text-gray-400 mt-1">
        Your home journey made simple — live progress tracking, milestone
        updates, and timelines all in one place.
      </p>
      <form onSubmit={handleSendOtp} className="space-y-4">
        {/* Name Field */}
        <div className="relative">
          <HiOutlineUser className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Name"
            value={fullName}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
            className="w-full bg-[#111] border border-[#333] text-white placeholder-gray-500 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] disabled:opacity-60 transition-colors"
          />
        </div>

        {/* Phone Field */}
        <div className="relative">
          <HiOutlinePhone className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            maxLength={10}
            required
            disabled={loading}
            className="w-full bg-[#111] border border-[#333] text-white placeholder-gray-500 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] disabled:opacity-60 transition-colors"
          />
        </div>

        {/* Email Field */}
        <div className="relative">
          <HiOutlineMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => updateEmail(e.target.value)}
            required
            disabled={loading}
            className="w-full bg-[#111] border border-[#333] text-white placeholder-gray-500 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] disabled:opacity-60 transition-colors"
          />
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
          {loading ? "Sending..." : "Send OTP"}
        </button>
        {errorMessage && (
          <p className="mt-2 text-sm text-red-400 text-center">{errorMessage}</p>
        )}
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
