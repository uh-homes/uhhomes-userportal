const { Warranty, WarrantyConfig, Project, User, ProjectManager } = require("../models");
const { Op } = require("sequelize");

// GET /pm/projects/:id/warranties - Get warranties for a project
const getProjectWarranties = async (req, res) => {
  try {
    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: req.params.id },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const warranties = await Warranty.findAll({
      where: { projectId: req.params.id },
      include: [{ model: User, as: "uploader", attributes: ["id", "fullName", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ status: "success", data: warranties });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /pm/projects/:id/warranties - Upload warranty/certificate
const uploadWarranty = async (req, res) => {
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

    const { type, warrantyType, name, description, issueDate, expiryDate, validityMonths, notes } = req.body;

    // If warrantyType provided, look up default validity from config
    let computedExpiryDate = expiryDate || null;
    let computedValidityMonths = validityMonths ? parseInt(validityMonths) : null;

    if (!computedExpiryDate && warrantyType && issueDate) {
      const config = await WarrantyConfig.findOne({ where: { warrantyType, isActive: true } });
      if (config) {
        computedValidityMonths = config.defaultValidityMonths;
        const issue = new Date(issueDate);
        issue.setMonth(issue.getMonth() + config.defaultValidityMonths);
        computedExpiryDate = issue.toISOString().split("T")[0];
      }
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const warranty = await Warranty.create({
      projectId: parseInt(req.params.id),
      uploadedBy: req.user.id,
      type: type || "WARRANTY",
      warrantyType: warrantyType || null,
      name: name || req.file.originalname,
      description: description || null,
      url: `${baseUrl}/uploads/${req.file.filename}`,
      issueDate: issueDate || new Date().toISOString().split("T")[0],
      expiryDate: computedExpiryDate,
      validityMonths: computedValidityMonths,
      notes: notes || null,
      status: "ACTIVE",
    });

    res.status(201).json({ status: "success", data: warranty });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /pm/warranties/:id - Update warranty details
const updateWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findByPk(req.params.id);
    if (!warranty) {
      return res.status(404).json({ status: "error", message: "Warranty not found." });
    }

    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: warranty.projectId },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    const { name, description, issueDate, expiryDate, validityMonths, status, notes } = req.body;
    await warranty.update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(issueDate && { issueDate }),
      ...(expiryDate && { expiryDate }),
      ...(validityMonths && { validityMonths: parseInt(validityMonths) }),
      ...(status && { status }),
      ...(notes !== undefined && { notes }),
    });

    res.json({ status: "success", data: warranty });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /pm/warranties/:id - Delete warranty
const deleteWarranty = async (req, res) => {
  try {
    const warranty = await Warranty.findByPk(req.params.id);
    if (!warranty) {
      return res.status(404).json({ status: "error", message: "Warranty not found." });
    }

    const assignment = await ProjectManager.findOne({
      where: { managerId: req.user.id, projectId: warranty.projectId },
    });
    if (!assignment) {
      return res.status(403).json({ status: "error", message: "Not assigned to this project." });
    }

    await warranty.destroy();
    res.json({ status: "success", message: "Warranty deleted." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /pm/warranty-configs - Get available warranty types (for dropdown)
const getWarrantyConfigs = async (req, res) => {
  try {
    const configs = await WarrantyConfig.findAll({
      where: { isActive: true },
      order: [["warrantyType", "ASC"]],
    });
    res.json({ status: "success", data: configs });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  getProjectWarranties,
  uploadWarranty,
  updateWarranty,
  deleteWarranty,
  getWarrantyConfigs,
};
