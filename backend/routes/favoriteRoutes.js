const express = require("express");
const router = express.Router();
const favoriteController = require("../controllers/favoriteController");
const { protect } = require("../middleware/auth");
const checkPermission = require("../middleware/checkPermission");

router.get("/", protect, checkPermission("favorites", "read"), favoriteController.getFavorites);
router.post("/toggle", protect, checkPermission("favorites", "write"), favoriteController.toggleFavorite);

module.exports = router;
