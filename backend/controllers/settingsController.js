const { User } = require("../models");

// GET /settings/notifications
exports.getNotificationPrefs = async (req, res) => {
  res.json({
    status: "success",
    data: req.user.notificationPrefs,
  });
};

// PUT /settings/notifications
exports.updateNotificationPrefs = async (req, res) => {
  const user = req.user;
  user.notificationPrefs = req.body;
  await user.save();

  res.json({
    status: "success",
    data: user.notificationPrefs,
  });
};

// GET /settings/download-data
exports.downloadData = async (req, res) => {
  const user = req.user.toSafeObject();

  const data = JSON.stringify(user, null, 2);
  const buffer = Buffer.from(data, "utf-8");

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="uhhomes-data-${user.id}.json"`);
  res.send(buffer);
};

// DELETE /settings/account
exports.deleteAccount = async (req, res) => {
  const { confirmation } = req.body;

  if (confirmation !== "DELETE MY ACCOUNT") {
    return res.status(400).json({ message: "Please type 'DELETE MY ACCOUNT' to confirm." });
  }

  await User.destroy({ where: { id: req.user.id } });

  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.json({
    status: "success",
    message: "Account deleted successfully.",
  });
};
