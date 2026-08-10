const { User, Project, ProjectManager } = require("../models");

// POST /admin/project-managers - Create a new project manager
const createProjectManager = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ status: "error", message: "Full name, email, and password are required." });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ status: "error", message: "A user with this email already exists." });
    }

    const user = await User.create({
      fullName,
      email,
      phone: phone || null,
      password,
      role: "user",
      category: "project_manager",
      isVerified: true,
      permissions: {
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
    });

    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json({ status: "success", data: userData });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /admin/project-managers - List all project managers
const getProjectManagers = async (req, res) => {
  try {
    const managers = await User.findAll({
      where: { category: "project_manager" },
      attributes: { exclude: ["password"] },
      include: [
        { model: Project, as: "managedProjects", through: { attributes: ["assignedAt"] } },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ status: "success", data: managers });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/project-managers/:id/assign - Assign PM to project(s)
const assignProjects = async (req, res) => {
  try {
    const { projectIds } = req.body;
    const managerId = parseInt(req.params.id);

    const manager = await User.findOne({ where: { id: managerId, category: "project_manager" } });
    if (!manager) {
      return res.status(404).json({ status: "error", message: "Project Manager not found." });
    }

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ status: "error", message: "projectIds array is required." });
    }

    const assignments = await ProjectManager.bulkCreate(
      projectIds.map((projectId) => ({ managerId, projectId })),
      { ignoreDuplicates: true }
    );

    res.status(201).json({ status: "success", data: assignments, message: "Projects assigned." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /admin/project-managers/:id/unassign/:projectId - Unassign PM from project
const unassignProject = async (req, res) => {
  try {
    const { id, projectId } = req.params;

    const deleted = await ProjectManager.destroy({
      where: { managerId: parseInt(id), projectId: parseInt(projectId) },
    });

    if (!deleted) {
      return res.status(404).json({ status: "error", message: "Assignment not found." });
    }

    res.json({ status: "success", message: "Project unassigned." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /admin/project-managers/:id - Delete project manager
const deleteProjectManager = async (req, res) => {
  try {
    const manager = await User.findOne({ where: { id: req.params.id, category: "project_manager" } });
    if (!manager) {
      return res.status(404).json({ status: "error", message: "Project Manager not found." });
    }

    await ProjectManager.destroy({ where: { managerId: manager.id } });
    await manager.destroy();

    res.json({ status: "success", message: "Project Manager deleted." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  createProjectManager,
  getProjectManagers,
  assignProjects,
  unassignProject,
  deleteProjectManager,
};
