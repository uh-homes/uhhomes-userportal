const { Favorite, Property } = require("../models");

// GET /favorites
exports.getFavorites = async (req, res) => {
  const favorites = await Favorite.findAll({
    where: { userId: req.user.id },
    include: [
      {
        model: Property,
        as: "property",
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.json({
    status: "success",
    data: favorites,
  });
};

// POST /favorites/toggle
exports.toggleFavorite = async (req, res) => {
  const { propertyId } = req.body;

  if (!propertyId) {
    return res.status(400).json({ message: "Property ID is required." });
  }

  const existing = await Favorite.findOne({
    where: { userId: req.user.id, propertyId },
  });

  if (existing) {
    await existing.destroy();
    return res.json({
      status: "success",
      data: null, // null signals removal on frontend
    });
  }

  const favorite = await Favorite.create({
    userId: req.user.id,
    propertyId,
  });

  // Reload with property association so frontend gets full data (elevation, thumbnail, etc.)
  const favoriteWithProperty = await Favorite.findByPk(favorite.id, {
    include: [{ model: Property, as: "property" }],
  });

  res.json({
    status: "success",
    data: favoriteWithProperty,
  });
};
