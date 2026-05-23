import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Login } from "./Login";
import { SignupStep1 } from "./SignupStep1";
import { SignupStep2 } from "./SignupStep2";
import { SignupStep3 } from "./SignupStep3";
import { IoMdClose } from "react-icons/io";
import SendOtpForm from "./ResetPassward/SendOtpForm";
import VerifyOtpForm from "./ResetPassward/VerifyOtpForm";
import ResetPasswordForm from "./ResetPassward/ResetPasswordForm";

const AuthenticationModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [userData, setUserData] = useState({});

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow || "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const resetAuthState = () => {
    setStep("login");
    setEmail("");
    setOtp("");
    setUserData({});
  };

  const handleClose = () => {
    resetAuthState();
    onClose?.();
  };

  const renderStep = () => {
    switch (step) {
      case "login":
        return (
          <Login
            goToSignup={() => setStep("signup-1")}
            goToForgot={() => setStep("forgot-send")}
            onClose={handleClose}
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
            onClose={onClose}
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-0 bg-white p-6 shadow-lg md:rounded-2xl fade-in-delay">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 cursor-pointer rounded-full p-2.5 text-gray-500 hover:bg-gray-200"
        >
          <IoMdClose />
        </button>
        {renderStep()}
      </div>
    </div>,
    document.body
  );
};

export default AuthenticationModal;
