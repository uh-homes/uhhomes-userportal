const { User, Project, ProjectSupervisor } = require("../models");
const bcrypt = require("bcryptjs");

// POST /admin/supervisors - Create a new site supervisor
const createSupervisor = async (req, res) => {
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
      category: "site_supervisor",
      isVerified: true,
    });

    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json({ status: "success", data: userData });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /admin/supervisors - List all site supervisors
const getSupervisors = async (req, res) => {
  try {
    const supervisors = await User.findAll({
      where: { category: "site_supervisor" },
      attributes: { exclude: ["password"] },
      include: [
        { model: Project, as: "supervisedProjects", through: { attributes: ["assignedAt"] } },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ status: "success", data: supervisors });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/supervisors/:id/assign - Assign supervisor to project(s)
const assignProjects = async (req, res) => {
  try {
    const { projectIds } = req.body;
    const supervisorId = parseInt(req.params.id);

    const supervisor = await User.findOne({ where: { id: supervisorId, category: "site_supervisor" } });
    if (!supervisor) {
      return res.status(404).json({ status: "error", message: "Supervisor not found." });
    }

    if (!projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ status: "error", message: "projectIds array is required." });
    }

    // Create assignments (ignore duplicates)
    const assignments = await ProjectSupervisor.bulkCreate(
      projectIds.map((projectId) => ({ supervisorId, projectId })),
      { ignoreDuplicates: true }
    );

    res.status(201).json({ status: "success", data: assignments, message: "Projects assigned." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /admin/supervisors/:id/unassign/:projectId - Unassign supervisor from project
const unassignProject = async (req, res) => {
  try {
    const { id, projectId } = req.params;

    const deleted = await ProjectSupervisor.destroy({
      where: { supervisorId: parseInt(id), projectId: parseInt(projectId) },
    });

    if (!deleted) {
      return res.status(404).json({ status: "error", message: "Assignment not found." });
    }

    res.json({ status: "success", message: "Project unassigned." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /admin/supervisors/:id - Delete supervisor
const deleteSupervisor = async (req, res) => {
  try {
    const supervisor = await User.findOne({ where: { id: req.params.id, category: "site_supervisor" } });
    if (!supervisor) {
      return res.status(404).json({ status: "error", message: "Supervisor not found." });
    }

    // Remove all project assignments
    await ProjectSupervisor.destroy({ where: { supervisorId: supervisor.id } });
    await supervisor.destroy();

    res.json({ status: "success", message: "Supervisor deleted." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  createSupervisor,
  getSupervisors,
  assignProjects,
  unassignProject,
  deleteSupervisor,
};
