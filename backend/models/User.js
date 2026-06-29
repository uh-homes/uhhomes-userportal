const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcryptjs");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // null for Google OAuth users
    },
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    notificationPrefs: {
      type: DataTypes.JSON,
      defaultValue: {
        email: true,
        sms: false,
        push: true,
        constructionUpdates: true,
        documentAlerts: true,
        promotions: false,
      },
    },
    permissions: {
      type: DataTypes.JSON,
      defaultValue: {
        dashboard: { read: true, write: false },
        constructionTracker: { read: true, write: false },
        timeline: { read: true, write: false },
        gallery: { read: true, write: false },
        documents: { read: true, write: false, upload: false },
        inquiries: { read: true, write: true },
        alerts: { read: true, write: false },
        favorites: { read: true, write: true },
        profile: { read: true, write: true },
        reports: { read: true, download: true },
      },
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password") && user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

User.prototype.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toSafeObject = function () {
  const { password, ...safe } = this.toJSON();
  return safe;
};

module.exports = User;
