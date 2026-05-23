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
        <h2 className="text-2xl">Forgot Password</h2>
        <p className="text-sm text-gray-800 mt-1">
          Enter your account email and we’ll send a one-time code.
        </p>
      </div>

      <div className="relative">
        <HiOutlineMail className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={loading}
          className="w-full border rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSend}
          disabled={loading || !email}
          className="flex-1 bg-primary text-white py-2 rounded hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Sending..." : "Send OTP"}
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
