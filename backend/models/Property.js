const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Property = sequelize.define(
  "Property",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    elevation: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    halfBathCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    squareFeet: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    garageSpaces: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    storyCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    floorPlans: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Property;
