const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect, supervisorOnly } = require("../middleware/auth");
const supervisorController = require("../controllers/supervisorController");

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// All routes require authentication + supervisor role
router.use(protect, supervisorOnly);

// Dashboard
router.get("/dashboard", supervisorController.getDashboard);

// Projects
router.get("/projects", supervisorController.getAssignedProjects);
router.get("/projects/:id", supervisorController.getProjectDetail);
router.put("/projects/:id/progress", supervisorController.updateProgress);

// Milestones
router.post("/projects/:id/milestones", supervisorController.createMilestone);
router.put("/milestones/:id", supervisorController.updateMilestone);
router.post("/milestones/:id/inspect", upload.array("photos", 10), supervisorController.inspectMilestone);

// Updates (daily/weekly site updates)
router.post("/projects/:id/updates", supervisorController.createUpdate);
router.post("/updates/:id/media", upload.array("files", 10), supervisorController.uploadMedia);

// Issues & Escalations
router.post("/projects/:id/issues", supervisorController.logIssue);
router.post("/projects/:id/escalate", supervisorController.escalateToAdmin);

// Inquiries
router.get("/projects/:id/inquiries", supervisorController.getInquiries);
router.put("/inquiries/:id/respond", supervisorController.respondToInquiry);

// Documents
router.get("/projects/:id/documents", supervisorController.getDocuments);
router.post("/projects/:id/documents", upload.single("file"), supervisorController.uploadDocument);

// Timeline
router.get("/timeline/:projectId", supervisorController.getTimeline);

// Gallery
router.get("/gallery/:projectId", supervisorController.getGallery);
router.post("/gallery", supervisorController.createGallery);
router.post("/gallery/:galleryId/upload", upload.array("photos", 10), supervisorController.uploadGalleryPhotos);

// Alerts
router.get("/alerts", supervisorController.getAlerts);
router.put("/alerts/:id/read", supervisorController.markAlertRead);

// Profile
router.get("/profile", supervisorController.getProfile);
router.put("/profile", supervisorController.updateProfile);

// Reports
router.get("/reports", supervisorController.getReports);

module.exports = router;
