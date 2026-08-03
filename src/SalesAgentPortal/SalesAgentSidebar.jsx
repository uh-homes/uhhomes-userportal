import React from "react";
import logoUhhomes from "../assets/logowhite.png";
import faviconLogo from "../assets/favicon_uhhomes.webp";
import {
  HiOutlineViewGrid,
  HiOutlineHome,
  HiOutlineUserAdd,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineTrendingUp,
  HiOutlineCog,
  HiOutlineX,
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const SalesAgentSidebar = ({ open, setOpen, sidebarWidth = 250 }) => {
  const user = useSelector((state) => state?.user);
  const location = useLocation();

  const menuItems = [
    { title: "Dashboard", icon: <HiOutlineViewGrid />, path: "/sales/dashboard" },
    { title: "Property Catalog", icon: <HiOutlineHome />, path: "/sales/properties" },
    { title: "Prospect Leads", icon: <HiOutlineUserAdd />, path: "/sales/leads" },
    { title: "Property Tours", icon: <HiOutlineCalendar />, path: "/sales/tours" },
    { title: "Buyer Accounts", icon: <HiOutlineUsers />, path: "/sales/buyers" },
    { title: "Sales Pipeline", icon: <HiOutlineTrendingUp />, path: "/sales/pipeline" },
    { title: "Profile", icon: <HiOutlineCog />, path: "/sales/profile" },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      setOpen(false);
    }
  };

  const logoWidth = Math.max(sidebarWidth * 0.85, 60);

  return (
    <motion.div className="h-full bg-black flex flex-col overflow-hidden w-full">
      {/* Logo and Close */}
      <div className="flex items-center justify-between p-4">
        <Link to="/sales/dashboard">
          {open ? (
            <img
              src={logoUhhomes}
              alt="UH Homes"
              style={{ width: `${logoWidth}px` }}
              className="object-contain transition-all duration-300"
            />
          ) : (
            <img
              src={faviconLogo}
              alt="UH Homes"
              className="w-10 h-10 object-contain"
            />
          )}
        </Link>
        {open && (
          <button
            onClick={() => setOpen(false)}
            className="text-[#C5A572] hover:text-[#C5A572] md:hidden"
          >
            <HiOutlineX className="text-xl" />
          </button>
        )}
      </div>

      {/* Sales Agent Badge */}
      {open && (
        <div className="mx-4 mb-2 px-3 py-1.5 bg-[#C5A572]/20 rounded-lg text-center">
          <span className="text-xs font-semibold text-[#C5A572]">SALES AGENT PORTAL</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={index}>
                <Link
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-[#C5A572] text-white font-medium"
                      : "text-[#C5A572] hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <AnimatePresence>
                    {open && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="whitespace-nowrap overflow-hidden text-sm"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-[#C5A572] flex items-center justify-center text-white font-semibold text-sm">
            {user?.fullName?.charAt(0).toUpperCase() || "S"}
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-[#C5A572] truncate">{user?.fullName || "Sales Agent"}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default SalesAgentSidebar;
