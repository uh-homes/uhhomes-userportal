import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../UserPortal/Sidebar/Sidebar";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaBars } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { logoutUser } from "../services/authApi";
import { removeUser } from "../store/slice/userSlice";

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const user = useSelector((state) => state?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      await logoutUser();
      dispatch(removeUser());
      navigate("/");
    } catch (e) {
      // logoutUser already toasts on error; keep UX simple here
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* You can put your Sidebar here */}
      <aside className="sticky top-0 left-0 h-screen bg-white shadow-md z-50">
        <Sidebar open={open} setOpen={setOpen} />
      </aside>

      <main className="flex-1 bg-gray-100 z-40">
        <div className="flex justify-between items-center  px-5 py-3 p-2 bg-white shadow-lg sticky top-0 z-10">
          <button
            onClick={() => setOpen(!open)}
            className="bg-gradient-to-r from-[#1975A9] to-[#158C51] text-white p-2 rounded-full shadow "
          >
            <FaBars />
          </button>
          <div className="flex items-center gap-4">
            <h3 className="text-xl px-2 sm:px-6">Hello, {user?.fullName}</h3>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Logout"
              aria-label="Logout"
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loggingOut ? (
                <span className="block h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiLogOut size={20} className="text-gray-800" />
              )}
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
