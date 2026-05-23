import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Login } from "../Auth/Login";
import { addUser } from "../store/slice/userSlice";

export default function LoginPage() {
  const user = useSelector((state) => state?.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/userportal");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <Login
          onClose={() => navigate("/userportal")}
          goToSignup={() => {}}
          goToForgot={() => {}}
        />
      </div>
    </div>
  );
}
