import { useState } from "react";
import { sendOTP } from "../../services/authApi";
import { HiOutlineMail } from "react-icons/hi";
import { Slide, toast } from "react-toastify";
export default function SendOtpForm({ onNext, onBack }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await sendOTP(email);
      toast.success("OTP sent to your email", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true,
        theme: "light",
        transition: Slide,
      });
      onNext(email);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP", {
        position: "top-center",
        autoClose: 1500,
        hideProgressBar: true,
        theme: "light",
        transition: Slide,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl text-white">Forgot Password</h2>
        <p className="text-sm text-gray-400 mt-1">
          Enter your account email and we’ll send a one-time code.
        </p>
      </div>

      <div className="relative">
        <HiOutlineMail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={loading}
          className="w-full bg-[#111] border border-[#333] text-white placeholder-gray-500 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] disabled:opacity-60 transition-colors"
        />
      </div>

      <button
        onClick={handleSend}
        disabled={loading || !email}
        className="w-full bg-gradient-to-r from-[#C5A572] to-[#D4AF37] text-[#0D0D0D] font-semibold py-2.5 rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
      >
        {loading && (
          <span className="h-4 w-4 border-2 border-[#0D0D0D]/50 border-t-transparent rounded-full animate-spin"></span>
        )}
        {loading ? "Sending..." : "Send OTP"}
      </button>
      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="w-full px-4 py-2.5 border border-[#333] text-gray-300 rounded-lg hover:bg-[#1a1a1a] disabled:opacity-60 transition-colors"
      >
        Back
      </button>
    </div>
  );
}
