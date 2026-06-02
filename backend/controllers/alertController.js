const { Alert } = require("../models");
const { Op } = require("sequelize");

// GET /alerts
exports.getAlerts = async (req, res) => {
  const { type, channel, read, startDate, endDate } = req.query;

  const where = { userId: req.user.id };

  if (type) where.type = type;
  if (channel) where.channel = channel;
  if (read !== undefined) where.read = read === "true";
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[Op.lte] = new Date(endDate);
  }

  const alerts = await Alert.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  res.json({
    status: "success",
    data: { alerts },
  });
};

// GET /alerts/unread-count
exports.getUnreadCount = async (req, res) => {
  const count = await Alert.count({
    where: { userId: req.user.id, read: false },
  });

  res.json({
    status: "success",
    data: { count },
  });
};

// PATCH /alerts/:id/read
exports.markAsRead = async (req, res) => {
  const alert = await Alert.findOne({
    where: { id: req.params.id, userId: req.user.id },
  });

  if (!alert) {
    return res.status(404).json({ message: "Alert not found." });
  }

  alert.read = true;
  await alert.save();

  res.json({
    status: "success",
    data: alert,
  });
};

// PATCH /alerts/read-all
exports.markAllAsRead = async (req, res) => {
  await Alert.update(
    { read: true },
    { where: { userId: req.user.id, read: false } }
  );

  res.json({
    status: "success",
    message: "All alerts marked as read.",
  });
};
