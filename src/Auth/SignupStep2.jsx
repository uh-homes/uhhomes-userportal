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
      <h2 className="text-2xl font-bold text-center">Sign Up</h2>
      <h2 className="text-4xl text-center">Welcome</h2>
      <p className="text-center text-gray-800 mt-1">
        Enter the OTP sent to your email {email} to verify your identity.
      </p>
      <form onSubmit={handleVerify} className="space-y-4">
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              maxLength="1"
              disabled={loading}
              className="w-12 text-center border p-2 rounded text-xl disabled:opacity-60"
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
          className="w-full bg-primary text-white p-2 rounded cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin"></span>
          )}
          {loading ? "Verifying..." : "Verify OTP"}
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
