const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const WarrantyConfig = sequelize.define(
  "WarrantyConfig",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    warrantyType: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: "E.g., Structural, Plumbing, Electrical, Roofing, Appliances",
    },
    defaultValidityMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 12,
      comment: "Default warranty validity period in months",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = WarrantyConfig;
