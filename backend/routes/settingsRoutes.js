const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const { protect } = require("../middleware/auth");

router.get("/notifications", protect, settingsController.getNotificationPrefs);
router.put("/notifications", protect, settingsController.updateNotificationPrefs);
router.get("/download-data", protect, settingsController.downloadData);
router.delete("/account", protect, settingsController.deleteAccount);

module.exports = router;
