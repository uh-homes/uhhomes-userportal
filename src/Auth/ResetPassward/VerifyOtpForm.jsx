import { useState } from "react";
import { verifyOTP } from "../../services/authApi";
import { HiOutlineKey } from "react-icons/hi";
import { Slide, toast } from "react-toastify";

export default function VerifyOtpForm({ email, onVerified, onBack }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      await verifyOTP(email, otp);
      toast.success("OTP verified", {
        position: "top-center",
        autoClose: 800,
        hideProgressBar: true,
        theme: "light",
        transition: Slide,
      });
      onVerified(otp);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid or expired OTP", {
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
        <h2 className="text-2xl">Verify OTP</h2>
        <p className="text-sm text-gray-800 mt-1">We sent a code to {email}</p>
      </div>

      <div className="relative">
        <HiOutlineKey className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="6-digit code"
          inputMode="numeric"
          disabled={loading}
          className="w-full border rounded pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleVerify}
          disabled={loading || !otp}
          className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Verifying..." : "Verify OTP"}
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
