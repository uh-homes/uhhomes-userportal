/**
 * One-time script to link existing projects to their uhhomes.com property
 * record (parsed from the project name, e.g. "Vista at Park Place" -> "Vista")
 * and to backfill the standard 7-phase milestone template for projects that
 * have no milestones yet.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const sequelize = require("../config/database");
const Project = require("../models/Project");
const Property = require("../models/Property");
const Milestone = require("../models/Milestone");

const STANDARD_PHASES = [
  "Site Preparation",
  "Foundation",
  "Framing & Roofing",
  "Electrical & Plumbing",
  "Interior Finishing",
  "Exterior & Landscaping",
  "Final Inspection & Handover",
];

const seedMilestones = async (project) => {
  const count = await Milestone.count({ where: { projectId: project.id } });
  if (count > 0) return false;

  const start = project.startDate ? new Date(project.startDate) : null;
  const end = project.estimatedEndDate ? new Date(project.estimatedEndDate) : null;
  const span = start && end && end > start ? end - start : 14 * 30 * 24 * 60 * 60 * 1000; // ~14 months

  await Milestone.bulkCreate(
    STANDARD_PHASES.map((name, i) => ({
      projectId: project.id,
      name,
      status: "PLANNED",
      progress: 0,
      order: i + 1,
      date: start ? new Date(start.getTime() + (span * (i + 1)) / STANDARD_PHASES.length) : null,
    }))
  );
  return true;
};

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    // Add propertyId column if it doesn't exist
    try {
      await sequelize.getQueryInterface().addColumn("Projects", "propertyId", {
        type: sequelize.Sequelize.DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Properties", key: "id" },
      });
      console.log("✅ Added propertyId column to Projects table.");
    } catch (e) {
      if (e.message.includes("Duplicate column") || e.original?.code === "ER_DUP_FIELDNAME") {
        console.log("ℹ️  propertyId column already exists.");
      } else {
        throw e;
      }
    }

    const properties = await Property.findAll();
    const projects = await Project.findAll();

    // Link projects to properties by matching the plan name before " at "
    for (const project of projects) {
      if (project.propertyId) continue;
      const planName = project.name?.split(" at ")[0]?.trim();
      const property = planName
        ? properties.find((p) => p.name.toLowerCase() === planName.toLowerCase())
        : null;
      if (property) {
        await project.update({ propertyId: property.id });
        console.log(`${project.name} → ${property.name}: ✅ Linked`);
      } else {
        console.log(`${project.name}: ⚠️  No matching property found`);
      }
    }

    // Backfill standard milestones for projects that have none
    for (const project of projects) {
      const created = await seedMilestones(project);
      if (created) console.log(`${project.name}: ✅ Standard milestones created`);
    }

    console.log("\n✅ Done linking projects to properties.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
