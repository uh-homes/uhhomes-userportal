const sequelize = require("../config/database");
const User = require("./User");
const Otp = require("./Otp");
const Project = require("./Project");
const Milestone = require("./Milestone");
const Update = require("./Update");
const Media = require("./Media");
const Gallery = require("./Gallery");
const Document = require("./Document");
const Question = require("./Question");
const Favorite = require("./Favorite");
const Alert = require("./Alert");
const Property = require("./Property");
const ProjectSupervisor = require("./ProjectSupervisor");
const Lead = require("./Lead");
const Tour = require("./Tour");

// User -> Projects
User.hasMany(Project, { foreignKey: "userId", as: "projects" });
Project.belongsTo(User, { foreignKey: "userId", as: "user" });

// Project -> Milestones
Project.hasMany(Milestone, { foreignKey: "projectId", as: "milestones" });
Milestone.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// Project -> Updates
Project.hasMany(Update, { foreignKey: "projectId", as: "updates" });
Update.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// Milestone -> Updates
Milestone.hasMany(Update, { foreignKey: "milestoneId", as: "updates" });
Update.belongsTo(Milestone, { foreignKey: "milestoneId", as: "milestone" });

// Update -> Media
Update.hasMany(Media, { foreignKey: "updateId", as: "media" });
Media.belongsTo(Update, { foreignKey: "updateId", as: "update" });

// Gallery -> Media
Gallery.hasMany(Media, { foreignKey: "galleryId", as: "media" });
Media.belongsTo(Gallery, { foreignKey: "galleryId", as: "gallery" });

// Project -> Gallery
Project.hasMany(Gallery, { foreignKey: "projectId", as: "gallery" });
Gallery.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// Project -> Documents
Project.hasMany(Document, { foreignKey: "projectId", as: "documents" });
Document.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// User -> Questions
User.hasMany(Question, { foreignKey: "userId", as: "questions" });
Question.belongsTo(User, { foreignKey: "userId", as: "user" });

// Project -> Questions
Project.hasMany(Question, { foreignKey: "projectId", as: "questions" });
Question.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// Project -> Property
Project.belongsTo(Property, { foreignKey: "propertyId", as: "property" });
Property.hasMany(Project, { foreignKey: "propertyId", as: "projects" });

// User -> Favorites
User.hasMany(Favorite, { foreignKey: "userId", as: "favorites" });
Favorite.belongsTo(User, { foreignKey: "userId", as: "user" });

// Property -> Favorites
Property.hasMany(Favorite, { foreignKey: "propertyId", as: "favorites" });
Favorite.belongsTo(Property, { foreignKey: "propertyId", as: "property" });

// User -> Alerts
User.hasMany(Alert, { foreignKey: "userId", as: "alerts" });
Alert.belongsTo(User, { foreignKey: "userId", as: "user" });
Alert.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

// Supervisor <-> Projects (many-to-many)
User.belongsToMany(Project, { through: ProjectSupervisor, foreignKey: "supervisorId", otherKey: "projectId", as: "supervisedProjects" });
Project.belongsToMany(User, { through: ProjectSupervisor, foreignKey: "projectId", otherKey: "supervisorId", as: "supervisors" });
ProjectSupervisor.belongsTo(User, { foreignKey: "supervisorId", as: "supervisor" });
ProjectSupervisor.belongsTo(Project, { foreignKey: "projectId", as: "project" });

// Sales Agent -> Leads
User.hasMany(Lead, { foreignKey: "salesAgentId", as: "leads" });
Lead.belongsTo(User, { foreignKey: "salesAgentId", as: "salesAgent" });

// Lead -> Converted User
Lead.belongsTo(User, { foreignKey: "convertedUserId", as: "convertedUser" });

// Lead -> Property
Lead.belongsTo(Property, { foreignKey: "propertyId", as: "property" });
Property.hasMany(Lead, { foreignKey: "propertyId", as: "leads" });

// Lead -> Tours
Lead.hasMany(Tour, { foreignKey: "leadId", as: "tours" });
Tour.belongsTo(Lead, { foreignKey: "leadId", as: "lead" });

// Tour -> Sales Agent
Tour.belongsTo(User, { foreignKey: "salesAgentId", as: "salesAgent" });

// Tour -> Property
Tour.belongsTo(Property, { foreignKey: "propertyId", as: "property" });
Property.hasMany(Tour, { foreignKey: "propertyId", as: "tours" });

module.exports = {
  sequelize,
  User,
  Otp,
  Project,
  Milestone,
  Update,
  Media,
  Gallery,
  Document,
  Question,
  Favorite,
  Alert,
  Property,
  ProjectSupervisor,
  Lead,
  Tour,
};
