const { User, Project, Milestone, Update, Media, Gallery, Document, Question, Alert, ProjectSupervisor, sequelize } = require("../models");
const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");

// GET /supervisor/projects - Get all assigned projects
const getAssignedProjects = async (req, res) => {
  try {
    const assignments = await ProjectSupervisor.findAll({
      where: { supervisorId: req.user.id },
      include: [
        {
          model: Project,
          as: "project",
          include: [
            { model: User, as: "user", attributes: ["id", "fullName", "email", "phone"] },
            { model: Milestone, as: "milestones" },
          ],
        },
      ],
    });

    const projects = assignments.map((a) => a.project);
    res.json({ status: "success", data: projects });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /supervisor/projects/:id - Get project detail
const getProjectDetail = async (req, res) => {
  try {
    // Verify supervisor is assigned to this project
    const assignment = await ProjectSupervisor.findOne({
      where: { supervisorId: req.user.id, projectId: req.params.id },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: ["id", "fullName", "email", "phone"] },
        { model: Milestone, as: "milestones" },
        { model: Update, as: "updates", include: [{ model: Media, as: "media" }] },
        { model: Gallery, as: "gallery", include: [{ model: Media, as: "media" }] },
        { model: Document, as: "documents" },
        { model: Question, as: "questions", include: [{ model: User, as: "user", attributes: ["id", "fullName", "email"] }] },
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

// POST /supervisor/projects/:id/milestones - Create milestone
const createMilestone = async (req, res) => {
  try {
    const assignment = await ProjectSupervisor.findOne({
      where: { supervisorId: req.user.id, projectId: req.params.id },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const { name, description, status, date, progress, order } = req.body;
    const milestone = await Milestone.create({
      projectId: parseInt(req.params.id),
      name,
      description,
      status: status || "PLANNED",
      date,
      progress: progress || 0,
      order,
    });

    res.status(201).json({ status: "success", data: milestone });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /supervisor/milestones/:id - Update milestone
const updateMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id);
    if (!milestone) {
      return res.status(404).json({ status: "error", message: "Milestone not found." });
    }

    // Verify supervisor is assigned
    const assignment = await ProjectSupervisor.findOne({
      where: { supervisorId: req.user.id, projectId: milestone.projectId },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const { name, description, status, date, progress, order } = req.body;
    await milestone.update({ name, description, status, date, progress, order });

    res.json({ status: "success", data: milestone });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /supervisor/projects/:id/updates - Post daily/weekly site update
const createUpdate = async (req, res) => {
  try {
    const assignment = await ProjectSupervisor.findOne({
      where: { supervisorId: req.user.id, projectId: req.params.id },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const { title, description, milestoneId } = req.body;
    const update = await Update.create({
      projectId: parseInt(req.params.id),
      milestoneId: milestoneId || null,
      title,
      description,
    });

    res.status(201).json({ status: "success", data: update });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /supervisor/updates/:id/media - Upload photos/videos from site
const uploadMedia = async (req, res) => {
  try {
    const update = await Update.findByPk(req.params.id);
    if (!update) {
      return res.status(404).json({ status: "error", message: "Update not found." });
    }

    const assignment = await ProjectSupervisor.findOne({
      where: { supervisorId: req.user.id, projectId: update.projectId },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: "error", message: "No files uploaded." });
    }

    const mediaRecords = await Media.bulkCreate(
      req.files.map((file) => ({
        updateId: update.id,
        type: file.mimetype.startsWith("video") ? "VIDEO" : "IMAGE",
        url: `/uploads/${file.filename}`,
        caption: req.body.caption || null,
      }))
    );

    res.status(201).json({ status: "success", data: mediaRecords });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /supervisor/projects/:id/progress - Update milestone progress %
const updateProgress = async (req, res) => {
  try {
    const assignment = await ProjectSupervisor.findOne({
      where: { supervisorId: req.user.id, projectId: req.params.id },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const { completionPercentage } = req.body;
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ status: "error", message: "Project not found." });
    }

    await project.update({ completionPercentage });
    res.json({ status: "success", data: project });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /supervisor/projects/:id/issues - Log issues & delays
const logIssue = async (req, res) => {
  try {
    const assignment = await ProjectSupervisor.findOne({
      where: { supervisorId: req.user.id, projectId: req.params.id },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const { title, description, severity } = req.body;

    // Create an alert for the project's owner (buyer)
    const project = await Project.findByPk(req.params.id);
    const alert = await Alert.create({
      userId: project.userId,
      title: title || "Issue reported on your project",
      message: description,
      type: severity === "high" ? "DELAY" : "ISSUE",
      channel: "IN_APP",
      read: false,
    });

    res.status(201).json({ status: "success", data: alert });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /supervisor/projects/:id/escalate - Escalate delays to Admin
const escalateToAdmin = async (req, res) => {
  try {
    const assignment = await ProjectSupervisor.findOne({
      where: { supervisorId: req.user.id, projectId: req.params.id },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const { title, description } = req.body;

    // Find all admins and alert them
    const admins = await User.findAll({ where: { role: "admin" }, attributes: ["id"] });
    const alerts = await Alert.bulkCreate(
      admins.map((admin) => ({
        userId: admin.id,
        title: title || "Escalation from Site Supervisor",
        message: `Project #${req.params.id}: ${description}`,
        type: "ESCALATION",
        channel: "IN_APP",
        read: false,
      }))
    );

    res.status(201).json({ status: "success", data: alerts, message: "Escalated to admin." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /supervisor/projects/:id/inquiries - Get buyer inquiries for project
const getInquiries = async (req, res) => {
  try {
    const assignment = await ProjectSupervisor.findOne({
      where: { supervisorId: req.user.id, projectId: req.params.id },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const questions = await Question.findAll({
      where: { projectId: req.params.id },
      include: [{ model: User, as: "user", attributes: ["id", "fullName", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ status: "success", data: questions });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /supervisor/inquiries/:id/respond - Respond to buyer inquiry
const respondToInquiry = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ status: "error", message: "Inquiry not found." });
    }

    const assignment = await ProjectSupervisor.findOne({
      where: { supervisorId: req.user.id, projectId: question.projectId },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const { answer } = req.body;
    await question.update({ answer, status: "ANSWERED", answeredBy: req.user.id });

    res.json({ status: "success", data: question });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /supervisor/projects/:id/documents - Get project documents
const getDocuments = async (req, res) => {
  try {
    const assignment = await ProjectSupervisor.findOne({
      where: { supervisorId: req.user.id, projectId: req.params.id },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const documents = await Document.findAll({
      where: { projectId: req.params.id },
      order: [["createdAt", "DESC"]],
    });

    res.json({ status: "success", data: documents });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /supervisor/projects/:id/documents - Upload project document
const uploadDocument = async (req, res) => {
  try {
    const assignment = await ProjectSupervisor.findOne({
      where: { supervisorId: req.user.id, projectId: req.params.id },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file uploaded." });
    }

    const { title, category } = req.body;
    const document = await Document.create({
      projectId: parseInt(req.params.id),
      title: title || req.file.originalname,
      url: `/uploads/${req.file.filename}`,
      category: category || "GENERAL",
    });

    res.status(201).json({ status: "success", data: document });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /supervisor/dashboard - Dashboard stats for supervisor
const getDashboard = async (req, res) => {
  try {
    const assignments = await ProjectSupervisor.findAll({
      where: { supervisorId: req.user.id },
    });
    const projectIds = assignments.map((a) => a.projectId);

    const totalProjects = projectIds.length;
    const activeProjects = await Project.count({
      where: { id: { [Op.in]: projectIds }, status: "IN_PROGRESS" },
    });
    const completedProjects = await Project.count({
      where: { id: { [Op.in]: projectIds }, status: "COMPLETED" },
    });
    const pendingInquiries = await Question.count({
      where: { projectId: { [Op.in]: projectIds }, status: "PENDING" },
    });
    const totalMilestones = await Milestone.count({
      where: { projectId: { [Op.in]: projectIds } },
    });
    const completedMilestones = await Milestone.count({
      where: { projectId: { [Op.in]: projectIds }, status: "COMPLETED" },
    });

    res.json({
      status: "success",
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        pendingInquiries,
        totalMilestones,
        completedMilestones,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  getAssignedProjects,
  getProjectDetail,
  createMilestone,
  updateMilestone,
  createUpdate,
  uploadMedia,
  updateProgress,
  logIssue,
  escalateToAdmin,
  getInquiries,
  respondToInquiry,
  getDocuments,
  uploadDocument,
  getDashboard,
};
