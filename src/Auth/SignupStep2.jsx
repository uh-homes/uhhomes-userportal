import { verifySignUpOTP } from "../services/authApi";
import { toast } from "react-toastify";
import { useRef, useState } from "react";
export const SignupStep2 = ({ setStep, email, otp, setOtp }) => {
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);
  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await verifySignUpOTP(email, otp);
      toast.success(res.message);
      setStep("signup-3");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error?.response?.data?.message || "Verification failed");
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
        Verify your email
      </h2>
      <p className="text-center text-gray-400 mt-1">
        Enter the OTP sent to <span className="text-gray-200">{email}</span> to
        verify your identity.
      </p>
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex justify-center gap-3">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              maxLength="1"
              disabled={loading}
              className="w-14 h-14 text-center bg-[#111] border border-[#333] text-white rounded-lg text-2xl focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] disabled:opacity-60 transition-colors"
              value={otp[i] || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (!/^[0-9]?$/.test(val)) return; // allow only digits

                const updated = otp.split("");
                updated[i] = val;
                setOtp(updated.join(""));

                if (val && i < 3) {
                  inputsRef.current[i + 1]?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otp[i] && i > 0) {
                  inputsRef.current[i - 1]?.focus();
                }
              }}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={loading || otp?.length !== 4}
          className="w-full bg-gradient-to-r from-[#C5A572] to-[#D4AF37] text-[#0D0D0D] font-semibold py-2.5 rounded-lg hover:opacity-90 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-opacity"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-[#0D0D0D]/50 border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Verifying..." : "Verify OTP"}
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
