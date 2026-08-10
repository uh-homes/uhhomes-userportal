const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProjectManager = sequelize.define(
  "ProjectManager",
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
    managerId: {
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
        fields: ["projectId", "managerId"],
      },
    ],
  }
);

module.exports = ProjectManager;
