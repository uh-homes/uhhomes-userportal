const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Alert = sequelize.define(
  "Alert",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: "GENERAL",
    },
    channel: {
      type: DataTypes.ENUM("EMAIL", "SMS", "PUSH", "IN_APP"),
      defaultValue: "IN_APP",
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Alert;
