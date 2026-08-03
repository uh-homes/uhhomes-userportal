const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Tour = sequelize.define(
  "Tour",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    leadId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    salesAgentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    scheduledDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    scheduledTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"),
      defaultValue: "SCHEDULED",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Tour;
