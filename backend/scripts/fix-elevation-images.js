/**
 * One-time script to fix property elevation images.
 * Replaces Unsplash stock URLs with real uhhomes.com floor plan images.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const sequelize = require("../config/database");
const Property = require("../models/Property");

const elevationMap = {
  Zyra: "https://www.uhhomes.com/wp-content/uploads/2026/03/Zyra-banner-2-1.webp",
  Vista: "https://www.uhhomes.com/wp-content/uploads/2026/05/Chinna-3840-X-2175-1.webp",
  Velora: "https://www.uhhomes.com/wp-content/uploads/2026/05/PP-3840-X-2175-3.webp",
  Nexa: "https://www.uhhomes.com/wp-content/uploads/2026/04/Ranch-Elevation-2-1.webp",
  Utopia: "https://www.uhhomes.com/wp-content/uploads/2026/05/utopia-banner-2-1.webp",
  Nirvaan: "https://www.uhhomes.com/wp-content/uploads/2026/05/nirvaan-banner-1.webp",
};

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    for (const [name, url] of Object.entries(elevationMap)) {
      const [count] = await Property.update(
        { elevation: url },
        { where: { name } }
      );
      console.log(`${name}: ${count > 0 ? "✅ Updated" : "⚠️  Not found"}`);
    }

    console.log("\n✅ All elevation images updated to uhhomes.com URLs.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
