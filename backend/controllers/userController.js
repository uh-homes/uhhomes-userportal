const { User, Otp } = require("../models");
const { generateToken, setTokenCookie } = require("../utils/generateToken");
const generateOtp = require("../utils/generateOtp");
const { sendOtpEmail } = require("../utils/sendEmail");
const { Op } = require("sequelize");

// POST /users/login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = generateToken(user.id);
  setTokenCookie(res, token);

  res.json({
    status: "success",
    data: { user: user.toSafeObject() },
  });
};

// POST /users/register
exports.register = async (req, res) => {
  const { fullName, phone, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Full name, email, and password are required." });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const user = await User.create({
    fullName,
    phone,
    email,
    password,
    isVerified: true,
  });

  // Send welcome email (non-blocking)
  const { sendWelcomeEmail } = require("../utils/sendEmail");
  sendWelcomeEmail(email, fullName).catch(() => {});

  res.status(201).json({
    status: "success",
    data: user.toSafeObject(),
  });
};

// GET /users/current-user
exports.getCurrentUser = async (req, res) => {
  res.json({
    status: "success",
    data: req.user.toSafeObject(),
  });
};

// POST /users/logout
exports.logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json({
    status: "success",
    message: "Logged out successfully.",
  });
};

// PUT /users/update
exports.updateProfile = async (req, res) => {
  const { fullName, phone } = req.body;
  const user = req.user;

  if (fullName) user.fullName = fullName;
  if (phone) user.phone = phone;

  await user.save();

  res.json({
    status: "success",
    data: user.toSafeObject(),
  });
};

// POST /users/signup-otp
exports.sendSignUpOTP = async (req, res) => {
  const { email, phone } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  // Delete old OTPs for this email
  await Otp.destroy({ where: { email, type: "signup" } });

  const otp = generateOtp();
  await Otp.create({
    email,
    otp,
    type: "signup",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  });

  await sendOtpEmail(email, otp);

  res.json({
    status: "success",
    message: "OTP sent successfully.",
  });
};

// POST /users/verify-signup-otp
exports.verifySignUpOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  const record = await Otp.findOne({
    where: {
      email,
      otp,
      type: "signup",
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!record) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  record.verified = true;
  await record.save();

  res.json({
    status: "success",
    message: "OTP verified successfully.",
  });
};

// POST /users/send-otp (for password reset)
exports.sendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: "No account found with this email." });
  }

  await Otp.destroy({ where: { email, type: "reset" } });

  const otp = generateOtp();
  await Otp.create({
    email,
    otp,
    type: "reset",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendOtpEmail(email, otp);

  res.json({
    status: "success",
    data: { message: "OTP sent to your email." },
  });
};

// POST /users/verify-otp (for password reset)
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  const record = await Otp.findOne({
    where: {
      email,
      otp,
      type: "reset",
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!record) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  record.verified = true;
  await record.save();

  res.json({
    status: "success",
    data: { message: "OTP verified." },
  });
};

// POST /users/reset-password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password are required." });
  }

  const record = await Otp.findOne({
    where: { email, otp, type: "reset", verified: true },
  });

  if (!record) {
    return res.status(400).json({ message: "OTP not verified. Please verify first." });
  }

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  user.password = newPassword;
  await user.save();

  // Clean up used OTP
  await Otp.destroy({ where: { email, type: "reset" } });

  res.json({
    status: "success",
    data: { message: "Password reset successfully." },
  });
};

// PATCH /users/update-password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new passwords are required." });
  }

  const user = req.user;
  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) {
    return res.status(401).json({ message: "Current password is incorrect." });
  }

  user.password = newPassword;
  await user.save();

  res.json({
    status: "success",
    message: "Password updated successfully.",
  });
};

// GET /users/user/:userId
exports.getUserById = async (req, res) => {
  const user = await User.findByPk(req.params.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.json({
    status: "success",
    data: user.toSafeObject(),
  });
};
