/**
 * One-time script to add propertyId column and link existing projects to properties.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const sequelize = require("../config/database");
const Project = require("../models/Project");
const Property = require("../models/Property");

const projectPropertyMap = {
  "Velora at Park Place": "Velora",
  "Vista at Park Place": "Vista",
  "Nirvaan at Park Place": "Nirvaan",
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

    // Link projects to properties
    for (const [projectName, propertyName] of Object.entries(projectPropertyMap)) {
      const property = await Property.findOne({ where: { name: propertyName } });
      if (!property) {
        console.log(`⚠️  Property "${propertyName}" not found.`);
        continue;
      }

      const [count] = await Project.update(
        { propertyId: property.id },
        { where: { name: projectName } }
      );
      console.log(`${projectName} → ${propertyName}: ${count > 0 ? "✅ Linked" : "⚠️  Project not found"}`);
    }

    console.log("\n✅ Done linking projects to properties.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
