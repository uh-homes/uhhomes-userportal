const { Property } = require("../models");

// GET /properties/:id
exports.getPropertyById = async (req, res) => {
  const property = await Property.findByPk(req.params.id);

  if (!property) {
    return res.status(404).json({ message: "Property not found." });
  }

  res.json({
    status: "success",
    data: property,
  });
};

// GET /properties
exports.getAllProperties = async (req, res) => {
  const properties = await Property.findAll({
    order: [["createdAt", "DESC"]],
  });

  res.json({
    status: "success",
    data: properties,
  });
};
