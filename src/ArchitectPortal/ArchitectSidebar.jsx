import React from "react";
import logoUhhomes from "../assets/logowhite.png";
import faviconLogo from "../assets/favicon_uhhomes.webp";
import {
  HiOutlineViewGrid,
  HiOutlineClipboardList,
  HiOutlinePhotograph,
  HiOutlineDocumentText,
  HiOutlineChatAlt2,
  HiOutlineX,
  HiOutlineClock,
  HiOutlineCog,
  HiOutlineColorSwatch,
  HiOutlinePencilAlt,
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ARCHITECT_MENU_CONFIG, filterMenuByPermissions } from "../config/permissionRoutes";

const ICON_MAP = {
  "/architect/dashboard": <HiOutlineViewGrid />,
  "/architect/projects": <HiOutlineClipboardList />,
  "/architect/floorplans": <HiOutlineDocumentText />,
  "/architect/uploads": <HiOutlinePhotograph />,
  "/architect/design-requests": <HiOutlineColorSwatch />,
  "/architect/change-requests": <HiOutlinePencilAlt />,
  "/architect/milestones": <HiOutlineClock />,
  "/architect/profile": <HiOutlineCog />,
};

const ArchitectSidebar = ({ open, setOpen, sidebarWidth = 250 }) => {
  const user = useSelector((state) => state?.user);
  const location = useLocation();

  const menuItems = filterMenuByPermissions(ARCHITECT_MENU_CONFIG, user?.permissions).map((item) => ({
    ...item,
    icon: ICON_MAP[item.path] || <HiOutlineViewGrid />,
  }));

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
        <Link to="/architect/dashboard">
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
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
            {user?.fullName?.charAt(0).toUpperCase() || "A"}
          </div>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-[#C5A572] truncate">{user?.fullName || "Architect"}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default ArchitectSidebar;
