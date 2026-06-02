import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Login } from "../Auth/Login";
import { SignupStep1 } from "../Auth/SignupStep1";
import { SignupStep2 } from "../Auth/SignupStep2";
import { SignupStep3 } from "../Auth/SignupStep3";
import SendOtpForm from "../Auth/ResetPassward/SendOtpForm";
import VerifyOtpForm from "../Auth/ResetPassward/VerifyOtpForm";
import ResetPasswordForm from "../Auth/ResetPassward/ResetPasswordForm";

export default function LoginPage() {
  const user = useSelector((state) => state?.user);
  const navigate = useNavigate();

  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userData, setUserData] = useState({});

  useEffect(() => {
    if (user) {
      navigate("/userportal");
    }
  }, [user, navigate]);

  const handleClose = () => navigate("/userportal");

  const renderStep = () => {
    switch (step) {
      case "login":
        return (
          <Login
            onClose={handleClose}
            goToSignup={() => setStep("signup-1")}
            goToForgot={() => setStep("forgot-send")}
          />
        );
      case "signup-1":
        return (
          <SignupStep1
            setStep={setStep}
            setEmail={setEmail}
            setUserData={setUserData}
          />
        );
      case "signup-2":
        return (
          <SignupStep2
            setStep={setStep}
            email={email}
            otp={otp}
            setOtp={setOtp}
          />
        );
      case "signup-3":
        return (
          <SignupStep3
            userData={userData}
            email={email}
            onClose={handleClose}
            setStep={setStep}
          />
        );
      case "forgot-send":
        return (
          <SendOtpForm
            onNext={(em) => {
              setEmail(em);
              setStep("forgot-verify");
            }}
            onBack={() => setStep("login")}
          />
        );
      case "forgot-verify":
        return (
          <VerifyOtpForm
            email={email}
            onVerified={(o) => {
              setOtp(o);
              setStep("forgot-reset");
            }}
            onBack={() => setStep("forgot-send")}
          />
        );
      case "forgot-reset":
        return (
          <ResetPasswordForm
            email={email}
            otp={otp}
            onBack={() => setStep("forgot-verify")}
            onDone={() => setStep("login")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] relative overflow-hidden">
      {/* Subtle gold gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#C5A572] opacity-[0.04] blur-3xl"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#D4AF37] opacity-[0.05] blur-3xl"></div>
      {/* Corner accent lines */}
      <div className="absolute top-0 left-0 w-32 h-[1px] bg-gradient-to-r from-[#C5A572] to-transparent opacity-40"></div>
      <div className="absolute top-0 left-0 h-32 w-[1px] bg-gradient-to-b from-[#C5A572] to-transparent opacity-40"></div>
      <div className="absolute bottom-0 right-0 w-32 h-[1px] bg-gradient-to-l from-[#C5A572] to-transparent opacity-40"></div>
      <div className="absolute bottom-0 right-0 h-32 w-[1px] bg-gradient-to-t from-[#C5A572] to-transparent opacity-40"></div>

      <div className="w-full max-w-xl bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-14 relative z-10 shadow-[0_0_40px_rgba(197,165,114,0.15),0_0_80px_rgba(197,165,114,0.05)]">
        {/* Gold accent line at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-[#C5A572] to-transparent rounded-full"></div>
        {renderStep()}
      </div>
    </div>
  );
}
