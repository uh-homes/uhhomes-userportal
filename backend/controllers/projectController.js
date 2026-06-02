const { Project, Milestone, Update, Media, Gallery, Document, Question } = require("../models");

// GET /user-projects
exports.getUserProject = async (req, res) => {
  const project = await Project.findOne({
    where: { userId: req.user.id },
    include: [
      {
        model: Milestone,
        as: "milestones",
        order: [["order", "ASC"]],
      },
      {
        model: Update,
        as: "updates",
        include: [
          { model: Media, as: "media" },
          { model: Milestone, as: "milestone", attributes: ["id", "name"] },
        ],
        order: [["createdAt", "DESC"]],
        limit: 5,
      },
    ],
    order: [[{ model: Milestone, as: "milestones" }, "order", "ASC"]],
  });

  if (!project) {
    return res.json({
      status: "success",
      data: null,
    });
  }

  res.json({
    status: "success",
    data: project,
  });
};

// GET /user-projects/tracker
exports.getProjectTracker = async (req, res) => {
  const project = await Project.findOne({
    where: { userId: req.user.id },
    include: [
      {
        model: Milestone,
        as: "milestones",
        order: [["order", "ASC"]],
      },
      {
        model: Update,
        as: "updates",
        include: [
          { model: Media, as: "media" },
          { model: Milestone, as: "milestone", attributes: ["id", "name"] },
        ],
        order: [["createdAt", "DESC"]],
      },
      {
        model: Gallery,
        as: "gallery",
        include: [{ model: Media, as: "media" }],
      },
      {
        model: Document,
        as: "documents",
      },
    ],
    order: [
      [{ model: Milestone, as: "milestones" }, "order", "ASC"],
      [{ model: Update, as: "updates" }, "createdAt", "DESC"],
    ],
  });

  if (!project) {
    return res.json({
      status: "success",
      data: null,
    });
  }

  res.json({
    status: "success",
    data: project,
  });
};

// GET /user-projects/question
exports.getQuestions = async (req, res) => {
  const questions = await Question.findAll({
    where: { userId: req.user.id },
    order: [["createdAt", "DESC"]],
  });

  res.json({
    status: "success",
    data: questions,
  });
};

// POST /user-projects/question
exports.createQuestion = async (req, res) => {
  const { subject, message, projectId } = req.body;

  if (!subject || !message) {
    return res.status(400).json({ message: "Subject and message are required." });
  }

  const question = await Question.create({
    userId: req.user.id,
    projectId: projectId || null,
    subject,
    message,
  });

  res.status(201).json({
    status: "success",
    data: question,
  });
};
