const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect } = require("../middleware/auth");

router.get("/", protect, projectController.getUserProject);
router.get("/tracker", protect, projectController.getProjectTracker);
router.get("/question", protect, projectController.getQuestions);
router.post("/question", protect, projectController.createQuestion);

module.exports = router;
