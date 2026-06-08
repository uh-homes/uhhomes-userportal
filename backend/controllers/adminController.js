const { User, Project, Milestone, Update, Media, Gallery, Document, Alert, Property, Favorite, Question, sequelize } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

// GET /admin/stats - Dashboard statistics
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.count({ where: { role: "user" } });
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: "IN_PROGRESS" } });
    const completedProjects = await Project.count({ where: { status: "COMPLETED" } });
    const totalAlerts = await Alert.count();
    const unreadAlerts = await Alert.count({ where: { read: false } });
    const totalProperties = await Property.count();
    const totalFavorites = await Favorite.count();

    // Inquiry stats
    const totalInquiries = await Question.count();
    const pendingInquiries = await Question.count({ where: { status: "PENDING" } });

    // Recent pending inquiries (last 5)
    const recentInquiries = await Question.findAll({
      where: { status: "PENDING" },
      include: [
        { model: User, as: "user", attributes: ["id", "fullName", "email"] },
        { model: Project, as: "project", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    // Recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersThisMonth = await User.count({
      where: { role: "user", createdAt: { [Op.gte]: thirtyDaysAgo } },
    });

    // Average completion percentage
    const avgCompletion = await Project.findOne({
      attributes: [[sequelize.fn("AVG", sequelize.col("completionPercentage")), "avg"]],
    });

    res.json({
      status: "success",
      data: {
        totalUsers,
        newUsersThisMonth,
        totalProjects,
        activeProjects,
        completedProjects,
        totalAlerts,
        unreadAlerts,
        totalProperties,
        totalFavorites,
        avgCompletion: Math.round(avgCompletion?.dataValues?.avg || 0),
        totalInquiries,
        pendingInquiries,
        recentInquiries,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /admin/users - List all users
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: "user" },
      attributes: { exclude: ["password"] },
      include: [
        { model: Project, as: "projects" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ status: "success", data: users });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /admin/users/:id - Get user details
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Project,
          as: "projects",
          include: [
            { model: Milestone, as: "milestones", order: [["order", "ASC"]] },
            { model: Update, as: "updates", include: [{ model: Media, as: "media" }] },
            { model: Gallery, as: "gallery", include: [{ model: Media, as: "media" }] },
            { model: Document, as: "documents" },
          ],
        },
        { model: Alert, as: "alerts", order: [["createdAt", "DESC"]] },
        { model: Favorite, as: "favorites", include: [{ model: Property, as: "property" }] },
      ],
    });

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    res.json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /admin/users/:id - Update user
const updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    const { fullName, email, phone, isVerified } = req.body;
    await user.update({ fullName, email, phone, isVerified });

    res.json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /admin/users/:id - Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }
    if (user.role === "admin") {
      return res.status(403).json({ status: "error", message: "Cannot delete admin." });
    }

    await user.destroy();
    res.json({ status: "success", message: "User deleted." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /admin/projects - All projects with user info
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "fullName", "email"] },
        { model: Milestone, as: "milestones", order: [["order", "ASC"]] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ status: "success", data: projects });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /admin/projects/:id - Project detail
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "fullName", "email"] },
        { model: Milestone, as: "milestones", order: [["order", "ASC"]] },
        { model: Update, as: "updates", include: [{ model: Media, as: "media" }] },
        { model: Gallery, as: "gallery", include: [{ model: Media, as: "media" }] },
        { model: Document, as: "documents" },
      ],
    });

    if (!project) {
      return res.status(404).json({ status: "error", message: "Project not found." });
    }

    res.json({ status: "success", data: project });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /admin/projects/:id - Update project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ status: "error", message: "Project not found." });
    }

    const { name, address, status, completionPercentage, startDate, estimatedEndDate } = req.body;
    await project.update({ name, address, status, completionPercentage, startDate, estimatedEndDate });

    res.json({ status: "success", data: project });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/projects - Create project for a user
const createProject = async (req, res) => {
  try {
    const { userId, name, address, status, completionPercentage, startDate, estimatedEndDate } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found." });
    }

    const project = await Project.create({
      userId, name, address, status: status || "PLANNED",
      completionPercentage: completionPercentage || 0, startDate, estimatedEndDate,
    });

    res.status(201).json({ status: "success", data: project });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/projects/:id/milestones - Add milestone
const addMilestone = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ status: "error", message: "Project not found." });
    }

    const { name, description, status, date, progress, order } = req.body;
    const milestone = await Milestone.create({
      projectId: project.id, name, description, status: status || "PLANNED",
      date, progress: progress || 0, order,
    });

    res.status(201).json({ status: "success", data: milestone });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /admin/milestones/:id - Update milestone
const updateMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id);
    if (!milestone) {
      return res.status(404).json({ status: "error", message: "Milestone not found." });
    }

    const { name, description, status, date, progress, order } = req.body;
    await milestone.update({ name, description, status, date, progress, order });

    res.json({ status: "success", data: milestone });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /admin/alerts - All alerts
const getAllAlerts = async (req, res) => {
  try {
    const alerts = await Alert.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "fullName", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ status: "success", data: alerts });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/alerts - Create alert for user(s)
const createAlert = async (req, res) => {
  try {
    const { userId, userIds, title, message, type, channel } = req.body;

    const targetIds = userIds || (userId ? [userId] : []);
    if (targetIds.length === 0) {
      // Send to all users
      const allUsers = await User.findAll({ where: { role: "user" }, attributes: ["id"] });
      targetIds.push(...allUsers.map((u) => u.id));
    }

    const alerts = await Alert.bulkCreate(
      targetIds.map((id) => ({
        userId: id,
        title,
        message,
        type: type || "INFO",
        channel: channel || "IN_APP",
        read: false,
      }))
    );

    res.status(201).json({ status: "success", data: alerts, count: alerts.length });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /admin/alerts/:id - Delete alert
const deleteAlert = async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ status: "error", message: "Alert not found." });
    }
    await alert.destroy();
    res.json({ status: "success", message: "Alert deleted." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /admin/properties - All properties
const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ status: "success", data: properties });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/properties - Create property
const createProperty = async (req, res) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json({ status: "success", data: property });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /admin/properties/:id - Update property
const updateProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ status: "error", message: "Property not found." });
    }
    await property.update(req.body);
    res.json({ status: "success", data: property });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /admin/properties/:id - Delete property
const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id);
    if (!property) {
      return res.status(404).json({ status: "error", message: "Property not found." });
    }
    await property.destroy();
    res.json({ status: "success", message: "Property deleted." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/users - Create a new user
const createUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ status: "error", message: "Full name, email, and password are required." });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ status: "error", message: "A user with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: role || "user",
      isVerified: true,
    });

    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json({ status: "success", data: userData });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAllProjects,
  getProjectById,
  updateProject,
  createProject,
  addMilestone,
  updateMilestone,
  getAllAlerts,
  createAlert,
  deleteAlert,
  getAllProperties,
  createProperty,
  updateProperty,
  deleteProperty,
};
