import React, { useState, useEffect, useRef } from "react";
import {
  FaCheckCircle,
  FaChevronRight,
  FaDownload,
  FaTrash,
  FaEnvelope,
  FaSms,
  FaBell,
  FaShieldAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import api from "../../Api/api";
import { removeUser } from "../../store/slice/userSlice";
import ChangePasswordModal from "./ChangePasswordModal";

const ProfileSettings = () => {
  const user = useSelector((state) => state?.user);
  const dispatch = useDispatch();
  const [notificationPrefs, setNotificationPrefs] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const messageTimeoutRef = useRef(null);

  const showTemporaryMessage = (text, duration = 3000) => {
    setMessage(text);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = null;
    }
    if (duration) {
      messageTimeoutRef.current = setTimeout(() => {
        setMessage("");
        messageTimeoutRef.current = null;
      }, duration);
    }
  };


  // Fetch notification preferences
  const fetchNotificationPreferences = async () => {
    try {
      const response = await api.get("/settings/notifications");
      setNotificationPrefs(response.data.data);
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      showTemporaryMessage("Failed to load notification preferences", null);
    }
  };

  useEffect(() => {
    fetchNotificationPreferences();
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  // Update notification preference
  const updateNotificationPreference = async (field, value) => {
    try {
      setIsLoading(true);
      const updatedPrefs = { ...notificationPrefs, [field]: value };

      await api.put("/settings/notifications", updatedPrefs);
      setNotificationPrefs(updatedPrefs);

      showTemporaryMessage("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      showTemporaryMessage("Failed to update preferences");
    } finally {
      setIsLoading(false);
    }
  };

  // Download user data
  const handleDownloadData = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/settings/download-data", {
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "user-data.json");
      document.body.appendChild(link);
      link.click();
      link.remove();

      showTemporaryMessage("Data download started");
    } catch (error) {
      console.error("Error downloading data:", error);
      showTemporaryMessage("Failed to download data");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSuccess = (msg) => {
    showTemporaryMessage(msg || "Password updated successfully");
  };
  // Delete account
  const handleDeleteAccount = async () => {
    const confirmation = prompt(
      "Are you sure you want to delete your account? This action cannot be undone.\n\nType 'DELETE MY ACCOUNT' to confirm:"
    );

    if (confirmation === "DELETE MY ACCOUNT") {
      try {
        setIsLoading(true);
        await api.delete("/settings/account", {
          data: { confirmation },
        });

        showTemporaryMessage("Account deleted successfully");
        // Redirect to login or home page after deletion
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } catch (error) {
        console.error("Error deleting account:", error);
        showTemporaryMessage("Failed to delete account");
      } finally {
        setIsLoading(false);
      }
    } else if (confirmation) {
      showTemporaryMessage("Confirmation phrase did not match");
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      setIsLoading(true);

      // Call your logout API endpoint if you have one
      await api.post("/users/logout");

      // Dispatch logout action to clear Redux state
      dispatch(removeUser());

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/";
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if API call fails, still clear local state
      dispatch(removeUser());
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FBF8F1] flex items-center justify-center">
        <div className="text-center">
          <p>Please log in to view your profile settings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F1] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl space-y-8">
        {/* Success/Error Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.includes("Failed")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-semibold">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {user?.fullName}
            </p>
            <p className="text-sm text-gray-800">{user?.email}</p>
            <p className="text-sm text-gray-800">{user?.phone}</p>
            <div className="flex items-center gap-1 text-[#C5A572] text-sm font-medium mt-1">
              <FaCheckCircle />
              Verified
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-800 mb-4 flex items-center gap-2 font-medium">
            <FaBell className="text-blue-500" />
            Notification Preferences
          </p>
          <div className="divide-y divide-gray-200 rounded-lg">
            {/* Email Notifications */}
            <div className="flex justify-between items-center p-3">
              <span className="flex items-center gap-2">
                <FaEnvelope className="text-gray-800" />
                Email Notifications
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notificationPrefs?.email || false}
                  onChange={(e) =>
                    updateNotificationPreference("email", e.target.checked)
                  }
                  disabled={isLoading}
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#C5A572] transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
              </label>
            </div>

            {/* SMS Notifications */}
            <div className="flex justify-between items-center p-3">
              <span className="flex items-center gap-2">
                <FaSms className="text-gray-800" />
                SMS Notifications
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={notificationPrefs?.sms || false}
                  onChange={(e) =>
                    updateNotificationPreference("sms", e.target.checked)
                  }
                  disabled={isLoading}
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-gradient transition-colors"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
              </label>
            </div>

            {/* Notification Topics */}
            <div className="p-3">
              <p className="font-medium mb-2">Notification Topics</p>
              {notificationPrefs?.topics &&
                Object.entries(notificationPrefs.topics).map(
                  ([topic, enabled]) => (
                    <div
                      key={topic}
                      className="flex justify-between items-center py-2"
                    >
                      <span className="capitalize">
                        {topic.replace(/([A-Z])/g, " $1").toLowerCase()}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={enabled}
                          onChange={(e) => {
                            const updatedTopics = {
                              ...notificationPrefs.topics,
                              [topic]: e.target.checked,
                            };
                            updateNotificationPreference(
                              "topics",
                              updatedTopics
                            );
                          }}
                          disabled={isLoading}
                        />
                        <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#C5A572] transition-colors"></div>
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-5"></div>
                      </label>
                    </div>
                  )
                )}
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
            <FaShieldAlt className="text-[#C5A572]" />
            Security
          </p>
          <div className="divide-y divide-gray-200 rounded-lg">
            <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50" onClick={() => setPasswordModalOpen(true)}>
              <span>Change Password</span>
              <FaChevronRight className="text-gray-400" />
            </div>
          </div>
        </div>

        {/* Privacy */}
        {/* <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-gray-800 font-semibold mb-4">Privacy</h3>
          <div className="divide-y divide-gray-200 rounded-lg">
            <div
              className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
              onClick={handleDownloadData}
            >
              <span className="flex items-center gap-2">
                <FaDownload /> Download data
              </span>
              <FaChevronRight className="text-gray-400" />
            </div>
            <div
              className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 text-red-500"
              onClick={handleDeleteAccount}
            >
              <span className="flex items-center gap-2">
                <FaTrash /> Delete account
              </span>
              <FaChevronRight className="text-gray-400" />
            </div>
          </div>
        </div> */}

        {/* Logout Section */}
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-800 font-semibold mb-4">Account</p>
          <div className="divide-y divide-gray-200 rounded-lg">
            <div
              className="flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50 text-red-500"
              onClick={handleLogout}
            >
              <span className="flex items-center gap-2">
                <FaSignOutAlt /> Logout
              </span>
              <FaChevronRight className="text-gray-400" />
            </div>
          </div>
        </div>

        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
          onSuccess={handlePasswordSuccess}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-gray-800">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
