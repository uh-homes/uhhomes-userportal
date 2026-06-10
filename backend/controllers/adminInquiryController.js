const { Question, User, Project } = require("../models");
const { sendInquiryResponseToUser } = require("../utils/sendEmail");

// GET /admin/inquiries - Get all user inquiries
const getAllInquiries = async (req, res) => {
  try {
    const questions = await Question.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "fullName", "email"] },
        { model: Project, as: "project", attributes: ["id", "name", "address"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const stats = {
      total: questions.length,
      pending: questions.filter((q) => q.status === "PENDING").length,
      responded: questions.filter((q) => q.status === "RESPONDED").length,
    };

    res.json({ status: "success", data: { questions, stats } });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// PUT /admin/inquiries/:id/respond - Respond to an inquiry
const respondToInquiry = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || !response.trim()) {
      return res.status(400).json({ status: "error", message: "Response message is required." });
    }

    const question = await Question.findByPk(req.params.id, {
      include: [{ model: User, as: "user", attributes: ["id", "fullName", "email"] }],
    });
    if (!question) {
      return res.status(404).json({ status: "error", message: "Inquiry not found." });
    }

    const respondedAt = new Date();
    await question.update({
      response: response.trim(),
      status: "RESPONDED",
      respondedAt,
    });

    // Send response email to user
    try {
      if (question.user?.email) {
        await sendInquiryResponseToUser(question.user.email, {
          userName: question.user.fullName,
          subject: question.subject,
          originalMessage: question.message,
          responseMessage: response.trim(),
          respondedAt: respondedAt.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
        });
      }
    } catch (emailErr) {
      console.error("Failed to send inquiry response email:", emailErr.message);
    }

    res.json({ status: "success", data: question });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /admin/inquiries/:id - Delete an inquiry
const deleteInquiry = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);
    if (!question) {
      return res.status(404).json({ status: "error", message: "Inquiry not found." });
    }

    await question.destroy();
    res.json({ status: "success", message: "Inquiry deleted." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = {
  getAllInquiries,
  respondToInquiry,
  deleteInquiry,
};
