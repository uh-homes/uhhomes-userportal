/**
 * Create or reset the admin user.
 *
 * Usage:  node scripts/create-admin.js
 *
 * This script will:
 *   1. Connect to the database using the existing .env config.
 *   2. Look for a user with email "admin@uhhomes.com".
 *      - If found, reset the password to "Admin@uhHomes12" and ensure role=admin.
 *      - If not found, create the admin user.
 *   3. Exit.
 *
 * It does NOT drop or recreate any tables.
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { sequelize, User } = require("../models");

const ADMIN_EMAIL = "admin@uhhomes.com";
const ADMIN_PASSWORD = "Admin@uhHomes12";

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    // Ensure tables exist (no-op if they already do)
    await sequelize.sync();

    let admin = await User.findOne({ where: { email: ADMIN_EMAIL } });

    if (admin) {
      console.log("Admin user already exists. Resetting password and ensuring role=admin ...");
      admin.password = ADMIN_PASSWORD;
      admin.role = "admin";
      admin.category = "super_admin";
      admin.isActive = true;
      admin.isVerified = true;
      await admin.save();
      console.log("Admin user updated successfully.");
    } else {
      admin = await User.create({
        fullName: "Admin User",
        email: ADMIN_EMAIL,
        phone: "1234567890",
        password: ADMIN_PASSWORD,
        role: "admin",
        category: "super_admin",
        isVerified: true,
        isActive: true,
      });
      console.log("Admin user created successfully.");
    }

    console.log(`\n  Email:    ${ADMIN_EMAIL}`);
    console.log(`  Password: ${ADMIN_PASSWORD}\n`);

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

run();
