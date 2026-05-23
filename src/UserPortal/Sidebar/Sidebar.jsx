import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaTools,
  FaHeart,
  FaBell,
  FaCog,
  FaInbox,
  FaBars,
  FaChevronDown,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { path } from "motion/react-client";
import { RxDashboard } from "react-icons/rx";
import { CiLocationOn } from "react-icons/ci";
import { RiHeartAdd2Line } from "react-icons/ri";
import { LuBellPlus } from "react-icons/lu";
import { TfiLocationPin } from "react-icons/tfi";
import { useSelector } from "react-redux";
import { FaX } from "react-icons/fa6";

const Sidebar = ({ open, setOpen }) => {
  const user = useSelector((state) => state?.user);
  const location = useLocation();

  // Sidebar Menu Config
  const menuItems = [
    {
      title: "Dashboard",
      icon: <RxDashboard />,
      path: "/userportal",
    },
    {
      title: "Construction Tracker",
      icon: <TfiLocationPin />,
      path: "/userconstruction",
    },
    {
      title: "Favorites",
      icon: <RiHeartAdd2Line />,
      path: "/favorites",
    },
    {
      title: "Alerts",
      icon: <LuBellPlus />,
      path: "/alerts",
    },
    {
      title: "Settings",
      icon: <FaCog />,
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
      animate={{ width: open ? "250px" : "70px" }}
      className={`bg-white shadow-md 
       h-screen p-4 md:flex flex-col justify-between fixed md:relative z-50 ${
         open ? "" : "hidden md:flex"
       }`}
    >
      <div className="mb-3">
        {/* Toggle Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="items-center gap-3 flex">
            <Link to={"/"} onClick={handleLinkClick}>
              <img
                src="https://res.cloudinary.com/davr2ejkc/image/upload/v1754028102/WhatsApp_Image_2025-07-29_at_11.01.04_PM_1_ycfp4n.png"
                alt="logo"
                className={`transition-all duration-300 ${
                  open ? "w-10" : "w-8"
                }`}
              />
            </Link>
            <div className="">
              <AnimatePresence>
                {open && (
                  <motion.p
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className=" text-2xl font-[400] text-gray-800 whitespace-nowrap overflow-hidden"
                  >
                    UH HOMES
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-800 focus:outline-none md:hidden"
          >
            <FaX />
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
                      <span className="text-xl"> {item.icon}</span>
                      {open &&
                        (item.subLinks ? (
                          <span>{item.title}</span>
                        ) : (
                          <> {item.title}</>
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
          <FaInbox />
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
