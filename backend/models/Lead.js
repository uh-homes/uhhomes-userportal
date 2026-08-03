const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Lead = sequelize.define(
  "Lead",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    salesAgentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    propertyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM("WEBSITE", "REFERRAL", "WALK_IN", "SOCIAL_MEDIA", "PHONE", "OTHER"),
      defaultValue: "OTHER",
    },
    status: {
      type: DataTypes.ENUM("NEW", "CONTACTED", "QUALIFIED", "TOUR_SCHEDULED", "NEGOTIATING", "CONVERTED", "LOST"),
      defaultValue: "NEW",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    convertedUserId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Lead;
