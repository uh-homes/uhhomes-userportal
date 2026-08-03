const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProjectSupervisor = sequelize.define(
  "ProjectSupervisor",
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
    supervisorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["projectId", "supervisorId"],
      },
    ],
  }
);

module.exports = ProjectSupervisor;
