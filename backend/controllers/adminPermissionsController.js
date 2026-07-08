const { User } = require("../models");

const DEFAULT_PERMISSIONS = {
  homebuyer: {
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
  },
  project_manager: {
    dashboard: { read: true, write: true },
    constructionTracker: { read: true, write: true },
    timeline: { read: true, write: true },
    gallery: { read: true, write: true },
    documents: { read: true, write: true, upload: true },
    inquiries: { read: true, write: true },
    alerts: { read: true, write: true },
    favorites: { read: true, write: true },
    profile: { read: true, write: true },
    reports: { read: true, download: true },
  },
  sales_agent: {
    dashboard: { read: true, write: false },
    constructionTracker: { read: true, write: false },
    timeline: { read: true, write: false },
    gallery: { read: true, write: false },
    documents: { read: true, write: false, upload: false },
    inquiries: { read: true, write: true },
    alerts: { read: true, write: false },
    favorites: { read: true, write: true },
    profile: { read: true, write: true },
    reports: { read: true, download: false },
  },
  super_admin: {
    dashboard: { read: true, write: true },
    constructionTracker: { read: true, write: true },
    timeline: { read: true, write: true },
    gallery: { read: true, write: true },
    documents: { read: true, write: true, upload: true },
    inquiries: { read: true, write: true },
    alerts: { read: true, write: true },
    favorites: { read: true, write: true },
    profile: { read: true, write: true },
    reports: { read: true, download: true },
  },
};

// GET /admin/permissions/:userId - Get user permissions
const getUserPermissions = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      attributes: ["id", "fullName", "email", "role", "category", "permissions"],
    });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    const category = user.category || "homebuyer";
    const permissions = user.permissions || DEFAULT_PERMISSIONS[category];

    res.json({
      status: "success",
      data: { userId: user.id, fullName: user.fullName, email: user.email, role: user.role, category, permissions },
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

    const { permissions, category } = req.body;

    const updateData = {};
    if (permissions && typeof permissions === "object") {
      updateData.permissions = permissions;
    }
    if (category && ["homebuyer", "project_manager", "sales_agent", "super_admin"].includes(category)) {
      updateData.category = category;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ status: "error", message: "Permissions or category is required." });
    }

    await user.update(updateData);

    res.json({
      status: "success",
      message: "Permissions updated successfully.",
      data: { userId: user.id, fullName: user.fullName, category: user.category, permissions: user.permissions },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /admin/permissions/bulk - Update permissions for multiple users
const bulkUpdatePermissions = async (req, res) => {
  try {
    const { userIds, permissions, category } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ status: "error", message: "userIds array is required." });
    }

    const updateData = {};
    if (permissions && typeof permissions === "object") updateData.permissions = permissions;
    if (category) updateData.category = category;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ status: "error", message: "Permissions or category is required." });
    }

    const users = await User.findAll({ where: { id: userIds } });

    for (const user of users) {
      await user.update(updateData);
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
      attributes: ["id", "fullName", "email", "phone", "role", "category", "permissions", "isVerified", "createdAt"],
      order: [["fullName", "ASC"]],
    });

    const usersWithDefaults = users.map((u) => {
      const userData = u.toJSON();
      const category = userData.category || (userData.role === "admin" ? "super_admin" : "homebuyer");
      return {
        ...userData,
        category,
        permissions: userData.permissions || DEFAULT_PERMISSIONS[category],
      };
    });

    res.json({ status: "success", data: usersWithDefaults });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/permissions/reset/:userId - Reset user permissions to category defaults
const resetUserPermissions = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    const category = user.category || "homebuyer";
    const defaults = DEFAULT_PERMISSIONS[category];

    await user.update({ permissions: defaults });

    res.json({
      status: "success",
      message: "Permissions reset to category defaults.",
      data: { userId: user.id, category, permissions: defaults },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /admin/permissions/category/:userId - Change user category
const updateUserCategory = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    const { category } = req.body;

    if (!category || !["homebuyer", "project_manager", "sales_agent", "super_admin"].includes(category)) {
      return res.status(400).json({ status: "error", message: "Valid category is required." });
    }

    const newPermissions = DEFAULT_PERMISSIONS[category];
    await user.update({ category, permissions: newPermissions });

    res.json({
      status: "success",
      message: `User moved to ${category} category.`,
      data: { userId: user.id, fullName: user.fullName, category, permissions: newPermissions },
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
  updateUserCategory,
  DEFAULT_PERMISSIONS,
};
