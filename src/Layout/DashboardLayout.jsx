import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../UserPortal/Sidebar/Sidebar";
import { useState, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FaBars } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { logoutUser } from "../services/authApi";
import { removeUser } from "../store/slice/userSlice";

export default function DashboardLayout() {
  const [open, setOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const sidebarRef = useRef(null);
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

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);

    const handleMouseMove = (e) => {
      const newWidth = e.clientX;
      if (newWidth >= 180 && newWidth <= 400) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, []);

  const currentWidth = open ? sidebarWidth : 70;

  return (
    <div className="flex min-h-screen">
      <aside
        ref={sidebarRef}
        className="sticky top-0 left-0 h-screen bg-[#2C2C2C] shadow-md z-50 relative flex-shrink-0"
        style={{ width: `${currentWidth}px`, transition: isResizing ? "none" : "width 0.3s ease" }}
      >
        <Sidebar open={open} setOpen={setOpen} sidebarWidth={currentWidth} />

        {/* Drag handle */}
        {open && (
          <div
            onMouseDown={startResizing}
            className={`absolute top-0 -right-1 w-3 h-full cursor-ew-resize group flex items-center justify-center transition-colors ${
              isResizing ? "bg-[#C5A572]/20" : "bg-transparent hover:bg-[#C5A572]/10"
            }`}
          >
            <div className={`w-[3px] h-12 rounded-full transition-opacity ${
              isResizing ? "bg-[#C5A572] opacity-100" : "bg-[#C5A572] opacity-0 group-hover:opacity-100"
            }`}></div>
          </div>
        )}
      </aside>

      <main className="flex-1 bg-[#FAFAFA] z-40 min-w-0">
        <div className="flex justify-between items-center px-5 py-3 bg-[#2C2C2C] shadow-sm sticky top-0 z-10">
          <button
            onClick={() => setOpen(!open)}
            className="bg-[#C5A572] text-white p-2.5 rounded-full shadow-md hover:bg-[#D4AF37] transition-colors"
          >
            <FaBars size={16} />
          </button>
          <div className="flex items-center gap-4">
            <h3 className="text-lg px-2 sm:px-6 text-[#C5A572]">Hello, {user?.fullName}</h3>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Logout"
              aria-label="Logout"
              className="p-2 rounded-full hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loggingOut ? (
                <span className="block h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiLogOut size={20} className="text-[#C5A572]" />
              )}
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
