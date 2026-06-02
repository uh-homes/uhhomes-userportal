const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.post("/login", userController.login);
router.post("/register", userController.register);
router.get("/current-user", protect, userController.getCurrentUser);
router.post("/logout", protect, userController.logout);
router.put("/update", protect, userController.updateProfile);
router.post("/signup-otp", userController.sendSignUpOTP);
router.post("/verify-signup-otp", userController.verifySignUpOTP);
router.post("/send-otp", userController.sendOTP);
router.post("/verify-otp", userController.verifyOTP);
router.post("/reset-password", userController.resetPassword);
router.patch("/update-password", protect, userController.changePassword);
router.get("/user/:userId", protect, userController.getUserById);

module.exports = router;
