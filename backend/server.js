require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const errorHandler = require("./middleware/errorHandler");
const { sequelize } = require("./models");

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const alertRoutes = require("./routes/alertRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "UHHomes API is running." });
});

// API Routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/user-projects", projectRoutes);
app.use("/favorites", favoriteRoutes);
app.use("/alerts", alertRoutes);
app.use("/properties", propertyRoutes);
app.use("/settings", settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: "error", message: "Route not found." });
});

// Error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully.");

    // Sync models (creates tables if they don't exist)
    await sequelize.sync({ alter: process.env.NODE_ENV === "development" });
    console.log("✅ Database synced.");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to start server:", error.message);
    process.exit(1);
  }
};

startServer();
