const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Warranty = sequelize.define(
  "Warranty",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("WARRANTY", "COMPLETION_CERTIFICATE"),
      allowNull: false,
      defaultValue: "WARRANTY",
    },
    warrantyType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "E.g., Structural, Plumbing, Electrical, Roofing, Appliances, General",
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "Null for lifetime warranties or completion certificates",
    },
    validityMonths: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Admin-configured validity in months",
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "EXPIRED", "REVOKED"),
      defaultValue: "ACTIVE",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Warranty;
