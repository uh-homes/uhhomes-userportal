require("dotenv").config();

const express = require("express");
const path = require("path");
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
const adminRoutes = require("./routes/adminRoutes");
const supervisorRoutes = require("./routes/supervisorRoutes");
const salesAgentRoutes = require("./routes/salesAgentRoutes");
const pmRoutes = require("./routes/pmRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowed = (process.env.FRONTEND_URL || "http://localhost:5173").split(",").map(s => s.trim());
    // Allow requests with no origin (e.g. curl, mobile apps)
    if (!origin || allowed.some(url => origin.startsWith(url.replace(/:\d+$/, '')) || origin === url)) {
      callback(null, origin || true);
    } else {
      callback(null, origin); // Allow all in dev; tighten in production
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
app.use("/admin", adminRoutes);
app.use("/supervisor", supervisorRoutes);
app.use("/sales", salesAgentRoutes);
app.use("/pm", pmRoutes);

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

    // Sync models (use alter:true only when schema changes are needed)
    await sequelize.sync();
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
