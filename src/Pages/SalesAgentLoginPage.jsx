import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { Slide, toast } from "react-toastify";
import { loginUser } from "../services/authApi";
import { addUser } from "../store/slice/userSlice";
import logoUhhomes from "../assets/logowhite.png";

export default function SalesAgentLoginPage() {
  const user = useSelector((state) => state?.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (user) {
      if (user.category === "sales_agent") {
        navigate("/sales/dashboard");
      } else if (user.category === "site_supervisor") {
        navigate("/supervisor/dashboard");
      } else if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/userportal");
      }
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      const loggedInUser = await loginUser({ email, password });
      if (loggedInUser.category !== "sales_agent") {
        setErrorMessage("This portal is for Sales Agents only.");
        setLoading(false);
        return;
      }
      dispatch(addUser(loggedInUser));
      toast.success("Login successful!", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true,
        theme: "light",
        transition: Slide,
      });
    } catch (error) {
      const errorPayload = error?.response?.data;
      const backendMessage =
        errorPayload?.message || errorPayload?.error || error?.message || "Please check your credentials.";
      setErrorMessage(backendMessage);
      toast.error(backendMessage, {
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
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background orbs */}
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

        <div className="space-y-3">
          <div className="flex items-center justify-center mb-4">
            <img src={logoUhhomes} alt="UH Homes" className="w-48 object-contain" />
          </div>
          <div className="flex items-center justify-center">
            <span className="px-3 py-1 bg-[#C5A572]/20 rounded-lg text-xs font-semibold text-[#C5A572] tracking-wider">SALES AGENT PORTAL</span>
          </div>
          <p className="text-center text-gray-400 mt-1">
            Sign in to manage leads, tours, and buyers.
          </p>

          <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div className="relative">
              <HiOutlineMail className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#111] border border-[#333] text-white placeholder-gray-500 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] disabled:opacity-60 transition-colors"
              />
            </div>

            <div className="relative">
              <HiOutlineLockClosed className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full bg-[#111] border border-[#333] text-white placeholder-gray-500 rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:border-[#C5A572] focus:ring-1 focus:ring-[#C5A572] disabled:opacity-60 transition-colors"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#C5A572] cursor-pointer transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C5A572] text-white font-semibold py-2.5 rounded-lg hover:bg-[#D4AF37] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {errorMessage && (
              <p className="mt-2 text-sm text-red-400 text-center">{errorMessage}</p>
            )}
          </form>

          <div className="text-center pt-4 border-t border-[#333]">
            <p className="text-gray-500 text-sm">
              Not a sales agent?{" "}
              <a href="/" className="text-[#C5A572] hover:text-[#D4AF37] transition-colors">
                Go to User Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
