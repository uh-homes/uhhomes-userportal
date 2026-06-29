const express = require("express");
const router = express.Router();
const alertController = require("../controllers/alertController");
const { protect } = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");

router.get("/", protect, checkPermission("alerts", "read"), alertController.getAlerts);
router.get("/unread-count", protect, checkPermission("alerts", "read"), alertController.getUnreadCount);
router.patch("/read-all", protect, checkPermission("alerts", "write"), alertController.markAllAsRead);
router.patch("/:id/read", protect, checkPermission("alerts", "write"), alertController.markAsRead);
router.delete("/all", protect, checkPermission("alerts", "write"), alertController.deleteAllAlerts);
router.delete("/:id", protect, checkPermission("alerts", "write"), alertController.deleteAlert);

module.exports = router;
