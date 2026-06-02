const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const { protect } = require("../middleware/auth");

router.get("/", protect, alertController.getAlerts);
router.get("/unread-count", protect, alertController.getUnreadCount);
router.patch("/read-all", protect, alertController.markAllAsRead);
router.patch("/:id/read", protect, alertController.markAsRead);

module.exports = router;
