const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Milestone = sequelize.define(
  "Milestone",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("PLANNED", "IN_PROGRESS", "DELAYED", "COMPLETE"),
      defaultValue: "PLANNED",
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    inspectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    inspectionNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    inspectionPhotos: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const val = this.getDataValue("inspectionPhotos");
        return val ? JSON.parse(val) : [];
      },
      set(val) {
        this.setDataValue("inspectionPhotos", val ? JSON.stringify(val) : null);
      },
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Milestone;
