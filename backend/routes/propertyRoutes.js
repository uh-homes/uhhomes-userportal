const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/propertyController");
const { protect } = require("../middleware/auth");

router.get("/", protect, propertyController.getAllProperties);
router.get("/:id", protect, propertyController.getPropertyById);

module.exports = router;
