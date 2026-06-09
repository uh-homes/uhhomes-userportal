import React, { useState, useEffect, useCallback } from "react";
import logoUhhomes from "../../assets/new uhhomes 2.webp";
import faviconLogo from "../../assets/favicon_uhhomes.webp";
import { FaChevronDown } from "react-icons/fa";
import {
  HiOutlineViewGrid,
  HiOutlineBell,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineHeart,
  HiOutlineCog,
  HiOutlineX,
  HiOutlineInbox,
} from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../Api/api";

const Sidebar = ({ open, setOpen, sidebarWidth = 250 }) => {
  const user = useSelector((state) => state?.user);
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await api.get("/alerts/unread-count");
      setUnreadCount(res.data?.data?.count || 0);
    } catch {}
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchUnreadCount]);

  // Sidebar Menu Config
  const menuItems = [
    {
      title: "Dashboard",
      icon: <HiOutlineViewGrid />,
      path: "/userportal",
    },
    {
      title: "Alerts",
      icon: <HiOutlineBell />,
      path: "/alerts",
    },
    {
      title: "Construction Tracker",
      icon: <HiOutlineLocationMarker />,
      path: "/userconstruction",
    },
    {
      title: "Construction Timeline",
      icon: <HiOutlineClock />,
      path: "/construction-timeline",
    },
    {
      title: "Favorites",
      icon: <HiOutlineHeart />,
      path: "/favorites",
    },
    {
      title: "Settings",
      icon: <HiOutlineCog />,
      path: "/profile",
    },
  ];

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeParent, setActiveParent] = useState(null);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 768) {
        // md breakpoint
        setOpen(false);
      }
    };

    // Close sidebar when location changes
    handleRouteChange();
  }, [location.pathname, setOpen]);

  // Set active parent based on current path
  useEffect(() => {
    const findActiveParent = () => {
      for (let i = 0; i < menuItems.length; i++) {
        const item = menuItems[i];

        // Check if it's a direct link
        if (item.path === location.pathname) {
          return i;
        }

        // Check if it's a parent with active sublink
        if (item.subLinks) {
          const activeSub = item.subLinks.findIndex(
            (sub) => sub.path === location.pathname
          );
          if (activeSub !== -1) {
            return i;
          }
        }
      }
      return null;
    };

    setActiveParent(findActiveParent());
  }, [location.pathname]);

  const toggleDropdown = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  // Handle link click - close sidebar on mobile
  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      // md breakpoint
      setOpen(false);
    }
  };

  return (
    <motion.div
      className={`bg-white w-full overflow-hidden
       h-screen p-4 md:flex flex-col justify-between fixed md:relative z-50 ${
         open ? "" : "hidden md:flex"
       }`}
    >
      <div className="mb-3">
        {/* Toggle Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="items-center gap-3 flex">
            <Link to={"/"} onClick={handleLinkClick}>
              {open ? (
                <img
                  src={logoUhhomes}
                  alt="UHHomes logo"
                  className="transition-all duration-200"
                  style={{ width: `${Math.max(sidebarWidth * 0.85, 150)}px` }}
                />
              ) : (
                <img
                  src={faviconLogo}
                  alt="UHHomes"
                  className="w-10 h-10 transition-all duration-300"
                />
              )}
            </Link>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-800 focus:outline-none md:hidden"
          >
            <HiOutlineX />
          </button>
        </div>

        {/* Menu Items */}
        <ul className="space-y-2">
          {menuItems.map((item, index) => {
            const isActiveParentItem = activeParent === index;
            const isDirectLinkActive =
              item.path && location.pathname === item.path;

            return (
              <li key={index} className="text-gray-800 font-medium">
                <div
                  className={`flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-green-50 ${
                    isActiveParentItem || isDirectLinkActive
                      ? "bg-gradient text-white "
                      : "text-gray-500"
                  }`}
                  onClick={() => (item.subLinks ? toggleDropdown(index) : null)}
                >
                  <Link
                    to={item.path}
                    className="w-full"
                    onClick={handleLinkClick}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl relative">
                        {item.icon}
                        {item.title === "Alerts" && unreadCount > 0 && !open && (
                          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                            {unreadCount > 9 ? "9+" : unreadCount}
                          </span>
                        )}
                      </span>
                      {open &&
                        (item.subLinks ? (
                          <span>{item.title}</span>
                        ) : (
                          <span className="flex items-center gap-2">
                            {item.title}
                            {item.title === "Alerts" && unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                {unreadCount}
                              </span>
                            )}
                          </span>
                        ))}
                    </div>
                  </Link>

                  {/* Show dropdown chevron only if subLinks exist */}
                  {open && item.subLinks && (
                    <FaChevronDown
                      className={`transition-transform duration-300 ${
                        activeDropdown === index ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>

                {/* Dropdown SubLinks */}
                <AnimatePresence>
                  {item.subLinks && open && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: activeDropdown === index ? 1 : 0,
                        height: activeDropdown === index ? "auto" : 0,
                      }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-8 mt-1 space-y-1 text-sm text-gray-800 overflow-hidden"
                    >
                      {item.subLinks.map((sub, i) => {
                        const isActiveSub = location.pathname === sub.path;
                        return (
                          <li
                            key={i}
                            className={`cursor-pointer p-1 rounded-md hover:text-green-600 ${
                              isActiveSub ? "text-green-700 font-semibold" : ""
                            }`}
                          >
                            <Link to={sub.path} onClick={handleLinkClick}>
                              {sub.name}
                            </Link>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        {/* Inbox Section */}
        <Link
          to="/inbox"
          className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
            location.pathname === "/inbox"
              ? "bg-gradient text-white font-semibold"
              : "bg-gradient text-white"
          }`}
          onClick={handleLinkClick}
        >
          <HiOutlineInbox />
          <AnimatePresence>
            {open && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Inbox
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* User Section */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          {user?.fullName?.charAt(0).toUpperCase()}
        </div>
        <AnimatePresence>
          {open && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-medium whitespace-nowrap overflow-hidden"
            >
              {user?.fullName}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Sidebar;
