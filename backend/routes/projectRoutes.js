const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { generateMyProjectReport } = require("../controllers/userReportController");
const { protect } = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");

router.get("/", protect, checkPermission("dashboard", "read"), projectController.getUserProject);
router.get("/tracker", protect, checkPermission("constructionTracker", "read"), projectController.getProjectTracker);
router.get("/report", protect, checkPermission("reports", "download"), generateMyProjectReport);
router.get("/question", protect, checkPermission("inquiries", "read"), projectController.getQuestions);
router.post("/question", protect, checkPermission("inquiries", "write"), projectController.createQuestion);
router.delete("/question/:id", protect, checkPermission("inquiries", "write"), projectController.deleteQuestion);

module.exports = router;
