const { User, Property, Lead, Tour, Project, Question, Favorite, sequelize } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");

// GET /sales/dashboard - Dashboard stats
const getDashboard = async (req, res) => {
  try {
    const agentId = req.user.id;

    const totalLeads = await Lead.count({ where: { salesAgentId: agentId } });
    const newLeads = await Lead.count({ where: { salesAgentId: agentId, status: "NEW" } });
    const convertedLeads = await Lead.count({ where: { salesAgentId: agentId, status: "CONVERTED" } });
    const lostLeads = await Lead.count({ where: { salesAgentId: agentId, status: "LOST" } });

    const upcomingTours = await Tour.count({
      where: {
        salesAgentId: agentId,
        status: "SCHEDULED",
        scheduledDate: { [Op.gte]: new Date() },
      },
    });

    const totalProperties = await Property.count();

    // Assigned buyers (converted leads with user accounts)
    const assignedBuyers = await Lead.count({
      where: { salesAgentId: agentId, convertedUserId: { [Op.ne]: null } },
    });

    // Pipeline breakdown
    const pipeline = await Lead.findAll({
      where: { salesAgentId: agentId },
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    // Recent leads (last 5)
    const recentLeads = await Lead.findAll({
      where: { salesAgentId: agentId },
      include: [{ model: Property, as: "property", attributes: ["id", "name", "location"] }],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    // Today's tours
    const todaysTours = await Tour.findAll({
      where: {
        salesAgentId: agentId,
        scheduledDate: new Date().toISOString().split("T")[0],
      },
      include: [
        { model: Lead, as: "lead", attributes: ["id", "name", "phone", "email"] },
        { model: Property, as: "property", attributes: ["id", "name", "location"] },
      ],
      order: [["scheduledTime", "ASC"]],
    });

    res.json({
      status: "success",
      data: {
        totalLeads,
        newLeads,
        convertedLeads,
        lostLeads,
        upcomingTours,
        totalProperties,
        assignedBuyers,
        pipeline,
        recentLeads,
        todaysTours,
        conversionRate: totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /sales/properties - View property catalog (synced from admin)
const getProperties = async (req, res) => {
  try {
    const properties = await Property.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Lead,
          as: "leads",
          where: { salesAgentId: req.user.id },
          required: false,
          attributes: ["id", "status"],
        },
      ],
    });

    res.json({ status: "success", data: properties });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /sales/properties/:id - Property detail
const getPropertyDetail = async (req, res) => {
  try {
    const property = await Property.findByPk(req.params.id, {
      include: [
        {
          model: Lead,
          as: "leads",
          where: { salesAgentId: req.user.id },
          required: false,
          include: [{ model: Tour, as: "tours" }],
        },
        {
          model: Tour,
          as: "tours",
          where: { salesAgentId: req.user.id },
          required: false,
        },
      ],
    });

    if (!property) {
      return res.status(404).json({ status: "error", message: "Property not found." });
    }

    res.json({ status: "success", data: property });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- LEADS (Prospect Management) ---

// GET /sales/leads - All leads for this agent
const getLeads = async (req, res) => {
  try {
    const { status, source } = req.query;
    const where = { salesAgentId: req.user.id };
    if (status) where.status = status;
    if (source) where.source = source;

    const leads = await Lead.findAll({
      where,
      include: [
        { model: Property, as: "property", attributes: ["id", "name", "location", "price", "thumbnail"] },
        { model: Tour, as: "tours" },
        { model: User, as: "convertedUser", attributes: ["id", "fullName", "email"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ status: "success", data: leads });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /sales/leads - Create a new lead
const createLead = async (req, res) => {
  try {
    const { name, email, phone, propertyId, source, notes } = req.body;

    if (!name) {
      return res.status(400).json({ status: "error", message: "Lead name is required." });
    }

    const lead = await Lead.create({
      salesAgentId: req.user.id,
      propertyId: propertyId || null,
      name,
      email,
      phone,
      source: source || "OTHER",
      notes,
    });

    const created = await Lead.findByPk(lead.id, {
      include: [{ model: Property, as: "property", attributes: ["id", "name", "location"] }],
    });

    res.status(201).json({ status: "success", data: created });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /sales/leads/:id - Update lead
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ where: { id: req.params.id, salesAgentId: req.user.id } });
    if (!lead) {
      return res.status(404).json({ status: "error", message: "Lead not found." });
    }

    const { name, email, phone, propertyId, source, status, notes } = req.body;
    await lead.update({ name, email, phone, propertyId, source, status, notes });

    const updated = await Lead.findByPk(lead.id, {
      include: [
        { model: Property, as: "property", attributes: ["id", "name", "location"] },
        { model: Tour, as: "tours" },
      ],
    });

    res.json({ status: "success", data: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /sales/leads/:id - Delete lead
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOne({ where: { id: req.params.id, salesAgentId: req.user.id } });
    if (!lead) {
      return res.status(404).json({ status: "error", message: "Lead not found." });
    }

    await Tour.destroy({ where: { leadId: lead.id } });
    await lead.destroy();

    res.json({ status: "success", message: "Lead deleted." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- TOURS ---

// GET /sales/tours - All tours for this agent
const getTours = async (req, res) => {
  try {
    const { status } = req.query;
    const where = { salesAgentId: req.user.id };
    if (status) where.status = status;

    const tours = await Tour.findAll({
      where,
      include: [
        { model: Lead, as: "lead", attributes: ["id", "name", "phone", "email"] },
        { model: Property, as: "property", attributes: ["id", "name", "location", "thumbnail"] },
      ],
      order: [["scheduledDate", "ASC"], ["scheduledTime", "ASC"]],
    });

    res.json({ status: "success", data: tours });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /sales/tours - Schedule a new tour
const createTour = async (req, res) => {
  try {
    const { leadId, propertyId, scheduledDate, scheduledTime, notes } = req.body;

    if (!leadId || !propertyId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ status: "error", message: "Lead, property, date, and time are required." });
    }

    // Verify lead belongs to this agent
    const lead = await Lead.findOne({ where: { id: leadId, salesAgentId: req.user.id } });
    if (!lead) {
      return res.status(404).json({ status: "error", message: "Lead not found." });
    }

    const tour = await Tour.create({
      leadId,
      salesAgentId: req.user.id,
      propertyId,
      scheduledDate,
      scheduledTime,
      notes,
    });

    // Update lead status to TOUR_SCHEDULED if currently before that stage
    if (["NEW", "CONTACTED", "QUALIFIED"].includes(lead.status)) {
      await lead.update({ status: "TOUR_SCHEDULED" });
    }

    const created = await Tour.findByPk(tour.id, {
      include: [
        { model: Lead, as: "lead", attributes: ["id", "name", "phone", "email"] },
        { model: Property, as: "property", attributes: ["id", "name", "location"] },
      ],
    });

    res.status(201).json({ status: "success", data: created });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /sales/tours/:id - Update tour
const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findOne({ where: { id: req.params.id, salesAgentId: req.user.id } });
    if (!tour) {
      return res.status(404).json({ status: "error", message: "Tour not found." });
    }

    const { scheduledDate, scheduledTime, status, notes, feedback } = req.body;
    await tour.update({ scheduledDate, scheduledTime, status, notes, feedback });

    res.json({ status: "success", data: tour });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /sales/tours/:id - Cancel/delete tour
const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findOne({ where: { id: req.params.id, salesAgentId: req.user.id } });
    if (!tour) {
      return res.status(404).json({ status: "error", message: "Tour not found." });
    }

    await tour.destroy();
    res.json({ status: "success", message: "Tour deleted." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- BUYERS ---

// POST /sales/buyers - Onboard new buyer (convert lead to user account)
const onboardBuyer = async (req, res) => {
  try {
    const { leadId, fullName, email, phone, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ status: "error", message: "Full name, email, and password are required." });
    }

    // Check if email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ status: "error", message: "A user with this email already exists." });
    }

    // Create the homebuyer account
    const user = await User.create({
      fullName,
      email,
      phone: phone || null,
      password,
      role: "user",
      category: "homebuyer",
      isVerified: true,
    });

    // If leadId provided, mark lead as converted
    if (leadId) {
      const lead = await Lead.findOne({ where: { id: leadId, salesAgentId: req.user.id } });
      if (lead) {
        await lead.update({ status: "CONVERTED", convertedUserId: user.id });
      }
    }

    const userData = user.toJSON();
    delete userData.password;

    res.status(201).json({ status: "success", data: userData });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /sales/buyers - View assigned buyer profiles (converted leads)
const getBuyers = async (req, res) => {
  try {
    const convertedLeads = await Lead.findAll({
      where: {
        salesAgentId: req.user.id,
        convertedUserId: { [Op.ne]: null },
      },
      include: [
        {
          model: User,
          as: "convertedUser",
          attributes: { exclude: ["password"] },
          include: [
            {
              model: Project,
              as: "projects",
              attributes: ["id", "name", "status", "completionPercentage", "address"],
            },
            {
              model: Favorite,
              as: "favorites",
              include: [{ model: Property, as: "property", attributes: ["id", "name"] }],
            },
          ],
        },
        { model: Property, as: "property", attributes: ["id", "name", "location"] },
      ],
      order: [["updatedAt", "DESC"]],
    });

    res.json({ status: "success", data: convertedLeads });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /sales/buyers/:id - View single buyer profile
const getBuyerDetail = async (req, res) => {
  try {
    const lead = await Lead.findOne({
      where: {
        convertedUserId: req.params.id,
        salesAgentId: req.user.id,
      },
    });

    if (!lead) {
      return res.status(404).json({ status: "error", message: "Buyer not found in your assignments." });
    }

    const buyer = await User.findByPk(req.params.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Project,
          as: "projects",
          attributes: ["id", "name", "status", "completionPercentage", "address", "startDate", "estimatedEndDate"],
        },
        {
          model: Favorite,
          as: "favorites",
          include: [{ model: Property, as: "property" }],
        },
      ],
    });

    if (!buyer) {
      return res.status(404).json({ status: "error", message: "Buyer not found." });
    }

    res.json({ status: "success", data: buyer });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- PIPELINE ---

// GET /sales/pipeline - Full pipeline view
const getPipeline = async (req, res) => {
  try {
    const stages = ["NEW", "CONTACTED", "QUALIFIED", "TOUR_SCHEDULED", "NEGOTIATING", "CONVERTED", "LOST"];

    const pipeline = {};
    for (const stage of stages) {
      pipeline[stage] = await Lead.findAll({
        where: { salesAgentId: req.user.id, status: stage },
        include: [
          { model: Property, as: "property", attributes: ["id", "name", "location", "price"] },
          { model: Tour, as: "tours", attributes: ["id", "scheduledDate", "scheduledTime", "status"] },
        ],
        order: [["updatedAt", "DESC"]],
      });
    }

    res.json({ status: "success", data: pipeline });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// --- PROFILE ---

// GET /sales/profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json({ status: "success", data: user });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /sales/profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const { fullName, phone, address } = req.body;
    await user.update({ fullName, phone, address });

    const updated = user.toJSON();
    delete updated.password;

    res.json({ status: "success", data: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  getDashboard,
  getProperties,
  getPropertyDetail,
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  getTours,
  createTour,
  updateTour,
  deleteTour,
  onboardBuyer,
  getBuyers,
  getBuyerDetail,
  getPipeline,
  getProfile,
  updateProfile,
};
