const express = require("express");
const router = express.Router();
const { protect, salesAgentOnly } = require("../middleware/auth");
const salesAgentController = require("../controllers/salesAgentController");

// All routes require authentication + sales agent role
router.use(protect, salesAgentOnly);

// Dashboard
router.get("/dashboard", salesAgentController.getDashboard);

// Properties (read-only catalog synced from admin)
router.get("/properties", salesAgentController.getProperties);
router.get("/properties/:id", salesAgentController.getPropertyDetail);

// Leads (prospect management)
router.get("/leads", salesAgentController.getLeads);
router.post("/leads", salesAgentController.createLead);
router.put("/leads/:id", salesAgentController.updateLead);
router.delete("/leads/:id", salesAgentController.deleteLead);

// Tours (schedule property tours)
router.get("/tours", salesAgentController.getTours);
router.post("/tours", salesAgentController.createTour);
router.put("/tours/:id", salesAgentController.updateTour);
router.delete("/tours/:id", salesAgentController.deleteTour);

// Buyers (onboard & view)
router.get("/buyers", salesAgentController.getBuyers);
router.get("/buyers/:id", salesAgentController.getBuyerDetail);
router.post("/buyers", salesAgentController.onboardBuyer);

// Pipeline
router.get("/pipeline", salesAgentController.getPipeline);

// Profile
router.get("/profile", salesAgentController.getProfile);
router.put("/profile", salesAgentController.updateProfile);

module.exports = router;
