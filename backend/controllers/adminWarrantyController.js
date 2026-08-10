const { WarrantyConfig, Warranty, Project, User } = require("../models");

// GET /admin/warranty-configs - Get all warranty configs
const getWarrantyConfigs = async (req, res) => {
  try {
    const configs = await WarrantyConfig.findAll({
      order: [["warrantyType", "ASC"]],
    });
    res.json({ status: "success", data: configs });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/warranty-configs - Create warranty type config
const createWarrantyConfig = async (req, res) => {
  try {
    const { warrantyType, defaultValidityMonths, description } = req.body;

    if (!warrantyType || !defaultValidityMonths) {
      return res.status(400).json({ status: "error", message: "Warranty type and default validity (months) are required." });
    }

    const existing = await WarrantyConfig.findOne({ where: { warrantyType } });
    if (existing) {
      return res.status(409).json({ status: "error", message: "This warranty type already exists." });
    }

    const config = await WarrantyConfig.create({
      warrantyType,
      defaultValidityMonths: parseInt(defaultValidityMonths),
      description: description || null,
    });

    res.status(201).json({ status: "success", data: config });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /admin/warranty-configs/:id - Update warranty config
const updateWarrantyConfig = async (req, res) => {
  try {
    const config = await WarrantyConfig.findByPk(req.params.id);
    if (!config) {
      return res.status(404).json({ status: "error", message: "Config not found." });
    }

    const { warrantyType, defaultValidityMonths, description, isActive } = req.body;
    await config.update({
      ...(warrantyType && { warrantyType }),
      ...(defaultValidityMonths && { defaultValidityMonths: parseInt(defaultValidityMonths) }),
      ...(description !== undefined && { description }),
      ...(isActive !== undefined && { isActive }),
    });

    res.json({ status: "success", data: config });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /admin/warranty-configs/:id - Delete warranty config
const deleteWarrantyConfig = async (req, res) => {
  try {
    const config = await WarrantyConfig.findByPk(req.params.id);
    if (!config) {
      return res.status(404).json({ status: "error", message: "Config not found." });
    }

    await config.destroy();
    res.json({ status: "success", message: "Warranty config deleted." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /admin/warranties - Get all warranties across projects
const getAllWarranties = async (req, res) => {
  try {
    const warranties = await Warranty.findAll({
      include: [
        { model: Project, as: "project", attributes: ["id", "name"] },
        { model: User, as: "uploader", attributes: ["id", "fullName", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json({ status: "success", data: warranties });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  getWarrantyConfigs,
  createWarrantyConfig,
  updateWarrantyConfig,
  deleteWarrantyConfig,
  getAllWarranties,
};
