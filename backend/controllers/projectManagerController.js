const { User, Project, Milestone, Update, Media, Gallery, Document, Question, Alert, ProjectManager, sequelize } = require("../models");
const { Op } = require("sequelize");

// GET /pm/dashboard - Dashboard stats for project manager
const getDashboard = async (req, res) => {
  try {
    const assignments = await ProjectManager.findAll({
      where: { managerId: req.user.id },
      include: [{ model: Project, as: "project", include: [{ model: Milestone, as: "milestones" }] }],
    });

    const projects = assignments.map((a) => a.project).filter(Boolean);
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "IN_PROGRESS" || p.status === "ACTIVE").length;
    const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;

    let totalMilestones = 0, completedMilestones = 0, pendingInquiries = 0;
    for (const p of projects) {
      const milestones = p.milestones || [];
      totalMilestones += milestones.length;
      completedMilestones += milestones.filter((m) => m.status === "COMPLETED").length;
    }

    // Count pending inquiries across managed projects
    const projectIds = projects.map((p) => p.id);
    if (projectIds.length > 0) {
      const inquiryCount = await Question.count({
        where: { projectId: { [Op.in]: projectIds }, reply: null },
      });
      pendingInquiries = inquiryCount;
    }

    res.json({
      status: "success",
      data: { totalProjects, activeProjects, completedProjects, totalMilestones, completedMilestones, pendingInquiries },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /pm/projects - Get all assigned projects
const getAssignedProjects = async (req, res) => {
  try {
    const assignments = await ProjectManager.findAll({
      where: { managerId: req.user.id },
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

    const projects = assignments.map((a) => a.project).filter(Boolean);
    res.json({ status: "success", data: projects });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /pm/projects/:id - Get project detail
const getProjectDetail = async (req, res) => {
  try {
    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: req.params.id },
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

// POST /pm/projects/:id/milestones - Create milestone
const createMilestone = async (req, res) => {
  try {
    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: req.params.id },
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

// PUT /pm/milestones/:id - Update milestone
const updateMilestone = async (req, res) => {
  try {
    const milestone = await Milestone.findByPk(req.params.id);
    if (!milestone) {
      return res.status(404).json({ status: "error", message: "Milestone not found." });
    }

    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: milestone.projectId },
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

// PUT /pm/projects/:id/progress - Update project completion %
const updateProgress = async (req, res) => {
  try {
    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: req.params.id },
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

// GET /pm/projects/:id/inquiries - Get inquiries for a project
const getInquiries = async (req, res) => {
  try {
    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: req.params.id },
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

// PUT /pm/inquiries/:id/respond - Respond to an inquiry
const respondToInquiry = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ status: "error", message: "Inquiry not found." });
    }

    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: question.projectId },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const { reply } = req.body;
    await question.update({ reply, repliedAt: new Date() });

    res.json({ status: "success", data: question });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /pm/projects/:id/documents - Get project documents
const getDocuments = async (req, res) => {
  try {
    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: req.params.id },
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

// POST /pm/projects/:id/documents - Upload a document
const uploadDocument = async (req, res) => {
  try {
    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: req.params.id },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    if (!req.file) {
      return res.status(400).json({ status: "error", message: "No file uploaded." });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const doc = await Document.create({
      projectId: parseInt(req.params.id),
      name: req.body.name || req.file.originalname,
      type: req.body.type || "OTHER",
      url: `${baseUrl}/uploads/${req.file.filename}`,
    });

    res.status(201).json({ status: "success", data: doc });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /pm/timeline/:projectId - Get project timeline
const getTimeline = async (req, res) => {
  try {
    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: req.params.projectId },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const milestones = await Milestone.findAll({
      where: { projectId: req.params.projectId },
      order: [["order", "ASC"], ["date", "ASC"]],
    });

    res.json({ status: "success", data: milestones });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /pm/gallery/:projectId - Get project gallery
const getGallery = async (req, res) => {
  try {
    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: req.params.projectId },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const galleries = await Gallery.findAll({
      where: { projectId: req.params.projectId },
      include: [{ model: Media, as: "media" }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ status: "success", data: galleries });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /pm/alerts - Get alerts for managed projects
const getAlerts = async (req, res) => {
  try {
    const assignments = await ProjectManager.findAll({
      where: { managerId: req.user.id },
      attributes: ["projectId"],
    });
    const projectIds = assignments.map((a) => a.projectId);

    const alerts = await Alert.findAll({
      where: {
        [Op.or]: [
          { userId: req.user.id },
          ...(projectIds.length > 0 ? [{ projectId: { [Op.in]: projectIds } }] : []),
        ],
      },
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    res.json({ status: "success", data: alerts });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /pm/alerts/:id/read - Mark alert as read
const markAlertRead = async (req, res) => {
  try {
    const alert = await Alert.findByPk(req.params.id);
    if (!alert) {
      return res.status(404).json({ status: "error", message: "Alert not found." });
    }
    await alert.update({ isRead: true });
    res.json({ status: "success", data: alert });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /pm/reports - Generate project-level reports data
const getReports = async (req, res) => {
  try {
    const assignments = await ProjectManager.findAll({
      where: { managerId: req.user.id },
      include: [
        {
          model: Project,
          as: "project",
          include: [
            { model: Milestone, as: "milestones" },
            { model: User, as: "user", attributes: ["id", "fullName", "email"] },
          ],
        },
      ],
    });

    const reports = assignments.map((a) => {
      const project = a.project;
      if (!project) return null;
      const milestones = project.milestones || [];
      const completed = milestones.filter((m) => m.status === "COMPLETED").length;
      const total = milestones.length;
      return {
        projectId: project.id,
        projectName: project.name,
        buyer: project.user,
        totalMilestones: total,
        completedMilestones: completed,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        status: project.status,
        startDate: project.startDate,
        expectedEnd: project.expectedEndDate,
      };
    }).filter(Boolean);

    res.json({ status: "success", data: reports });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /pm/profile - Get PM profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /pm/profile - Update PM profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    const user = await User.findByPk(req.user.id);
    await user.update({ fullName, phone, address });
    const safe = user.toSafeObject();
    res.json({ status: "success", data: safe });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  getDashboard,
  getAssignedProjects,
  getProjectDetail,
  createMilestone,
  updateMilestone,
  updateProgress,
  getInquiries,
  respondToInquiry,
  getDocuments,
  uploadDocument,
  getTimeline,
  getGallery,
  getAlerts,
  markAlertRead,
  getReports,
  getProfile,
  updateProfile,
};
