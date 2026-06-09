const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllProjects,
  getProjectById,
  updateProject,
  createProject,
  addMilestone,
  updateMilestone,
  getAllAlerts,
  createAlert,
  deleteAlert,
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} = require("../controllers/adminController");
const { getProjectGallery, createGallery, addPhotos, uploadPhotos, deletePhoto, deleteGallery } = require("../controllers/adminGalleryController");
const upload = require("../middleware/upload");
const { generateProjectReport, generateSummaryReport } = require("../controllers/adminReportController");
const { sendPushNotification, sendBulkNotifications, getNotificationHistory } = require("../controllers/adminNotificationController");
const { generateWeeklySummary, sendWeeklySummary, sendAllWeeklySummaries } = require("../controllers/adminAISummaryController");
const { getAllInquiries, respondToInquiry, deleteInquiry } = require("../controllers/adminInquiryController");

// All routes require auth + admin
router.use(protect, adminOnly);

// Dashboard stats
router.get("/stats", getStats);

// Users management
router.get("/users", getUsers);
router.post("/users", createUser);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Projects management
router.get("/projects", getAllProjects);
router.get("/projects/:id", getProjectById);
router.put("/projects/:id", updateProject);
router.post("/projects", createProject);
router.post("/projects/:id/milestones", addMilestone);
router.put("/milestones/:id", updateMilestone);

// Alerts management
router.get("/alerts", getAllAlerts);
router.post("/alerts", createAlert);
router.delete("/alerts/:id", deleteAlert);

// Properties management
router.get("/properties", getAllProperties);
router.post("/properties", createProperty);
router.put("/properties/:id", updateProperty);
router.delete("/properties/:id", deleteProperty);

// Photo Gallery by Phase
router.get("/gallery/:projectId", getProjectGallery);
router.post("/gallery", createGallery);
router.post("/gallery/:galleryId/photos", addPhotos);
router.post("/gallery/:galleryId/upload", upload.array("photos", 10), uploadPhotos);
router.delete("/gallery/photo/:mediaId", deletePhoto);
router.delete("/gallery/:galleryId", deleteGallery);

// PDF Reports
router.get("/reports/project/:id", generateProjectReport);
router.get("/reports/summary", generateSummaryReport);

// Push Notifications
router.post("/notifications/push", sendPushNotification);
router.post("/notifications/bulk", sendBulkNotifications);
router.get("/notifications/history", getNotificationHistory);

// AI Weekly Summary
router.post("/ai-summary/generate/:projectId", generateWeeklySummary);
router.post("/ai-summary/send/:projectId", sendWeeklySummary);
router.post("/ai-summary/send-all", sendAllWeeklySummaries);

// Inquiries management
router.get("/inquiries", getAllInquiries);
router.put("/inquiries/:id/respond", respondToInquiry);
router.delete("/inquiries/:id", deleteInquiry);

module.exports = router;
