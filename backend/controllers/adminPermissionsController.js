const { User } = require("../models");

const DEFAULT_PERMISSIONS = {
  dashboard: { read: true, write: false },
  constructionTracker: { read: true, write: false },
  timeline: { read: true, write: false },
  gallery: { read: true, write: false },
  documents: { read: true, write: false, upload: false },
  inquiries: { read: true, write: true },
  alerts: { read: true, write: false },
  favorites: { read: true, write: true },
  profile: { read: true, write: true },
  reports: { read: true, download: true },
};

// GET /admin/permissions/:userId - Get user permissions
const getUserPermissions = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: ["id", "fullName", "email", "role", "permissions"],
    });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    const permissions = user.permissions || DEFAULT_PERMISSIONS;

    res.json({
      status: "success",
      data: { userId: user.id, fullName: user.fullName, email: user.email, role: user.role, permissions },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /admin/permissions/:userId - Update user permissions
const updateUserPermissions = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    if (user.role === "admin") {
      return res.status(403).json({ status: "error", message: "Cannot modify admin permissions." });
    }

    const { permissions } = req.body;

    if (!permissions || typeof permissions !== "object") {
      return res.status(400).json({ status: "error", message: "Permissions object is required." });
    }

    await user.update({ permissions });

    res.json({
      status: "success",
      message: "Permissions updated successfully.",
      data: { userId: user.id, fullName: user.fullName, permissions: user.permissions },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /admin/permissions/bulk - Update permissions for multiple users
const bulkUpdatePermissions = async (req, res) => {
  try {
    const { userIds, permissions } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ status: "error", message: "userIds array is required." });
    }

    if (!permissions || typeof permissions !== "object") {
      return res.status(400).json({ status: "error", message: "Permissions object is required." });
    }

    const users = await User.findAll({ where: { id: userIds, role: "user" } });

    for (const user of users) {
      await user.update({ permissions });
    }

    res.json({
      status: "success",
      message: `Permissions updated for ${users.length} user(s).`,
      data: { updatedCount: users.length },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /admin/permissions - Get all users with their permissions
const getAllUsersPermissions = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "user" },
      attributes: ["id", "fullName", "email", "phone", "permissions", "isVerified", "createdAt"],
      order: [["fullName", "ASC"]],
    });

    const usersWithDefaults = users.map((u) => ({
      ...u.toJSON(),
      permissions: u.permissions || DEFAULT_PERMISSIONS,
    }));

    res.json({ status: "success", data: usersWithDefaults });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/permissions/reset/:userId - Reset user permissions to defaults
const resetUserPermissions = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    await user.update({ permissions: DEFAULT_PERMISSIONS });

    res.json({
      status: "success",
      message: "Permissions reset to defaults.",
      data: { userId: user.id, permissions: DEFAULT_PERMISSIONS },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  getUserPermissions,
  updateUserPermissions,
  bulkUpdatePermissions,
  getAllUsersPermissions,
  resetUserPermissions,
  DEFAULT_PERMISSIONS,
};
