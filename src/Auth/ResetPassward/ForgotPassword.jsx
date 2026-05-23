import React, { useState } from 'react'
import SendOtpForm from './SendOtpForm';
import VerifyOtpForm from './VerifyOtpForm';
import ResetPasswordForm from './ResetPasswordForm';

export default function ForgotPassword() {
    const [step ,setStep] = useState("send");
    const [email, setEmail] = useState("");


  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {step === "send" && <SendOtpForm onNext={(em) => { setEmail(em); setStep("verify"); }} />}
      {step === "verify" && <VerifyOtpForm email={email} onVerified={() => setStep("reset")} />}
      {step === "reset" && <ResetPasswordForm email={email} />}
    </div>
  )
}
