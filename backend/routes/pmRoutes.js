const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect, projectManagerOnly } = require("../middleware/auth");
const pmController = require("../controllers/projectManagerController");
const warrantyController = require("../controllers/warrantyController");

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads")),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// All routes require authentication + project_manager role
router.use(protect, projectManagerOnly);

// Dashboard
router.get("/dashboard", pmController.getDashboard);

// Projects
router.get("/projects", pmController.getAssignedProjects);
router.get("/projects/:id", pmController.getProjectDetail);
router.put("/projects/:id/progress", pmController.updateProgress);

// Milestones
router.post("/projects/:id/milestones", pmController.createMilestone);
router.put("/milestones/:id", pmController.updateMilestone);

// Inquiries
router.get("/projects/:id/inquiries", pmController.getInquiries);
router.put("/inquiries/:id/respond", pmController.respondToInquiry);

// Documents
router.get("/projects/:id/documents", pmController.getDocuments);
router.post("/projects/:id/documents", upload.single("file"), pmController.uploadDocument);

// Timeline
router.get("/timeline/:projectId", pmController.getTimeline);

// Gallery
router.get("/gallery/:projectId", pmController.getGallery);

// Alerts
router.get("/alerts", pmController.getAlerts);
router.put("/alerts/:id/read", pmController.markAlertRead);

// Reports
router.get("/reports", pmController.getReports);

// Warranties & Certificates
router.get("/warranty-configs", warrantyController.getWarrantyConfigs);
router.get("/projects/:id/warranties", warrantyController.getProjectWarranties);
router.post("/projects/:id/warranties", upload.single("file"), warrantyController.uploadWarranty);
router.put("/warranties/:id", warrantyController.updateWarranty);
router.delete("/warranties/:id", warrantyController.deleteWarranty);

// Profile
router.get("/profile", pmController.getProfile);
router.put("/profile", pmController.updateProfile);

module.exports = router;
