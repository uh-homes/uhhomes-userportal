const { Project, Milestone, Update, User, Alert, Media } = require("../models");
const { Op } = require("sequelize");
const { sendEmail } = require("../utils/sendEmail");

// Helper: gather project data for the past week
const getWeeklyData = async (projectId) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const project = await Project.findByPk(projectId, {
    include: [
      { model: User, as: "user", attributes: ["fullName", "email"] },
      { model: Milestone, as: "milestones", order: [["order", "ASC"]] },
      {
        model: Update, as: "updates",
        where: { createdAt: { [Op.gte]: oneWeekAgo } },
        required: false,
        include: [{ model: Media, as: "media" }],
      },
    ],
  });

  return project;
};

// Helper: generate summary without OpenAI (rule-based fallback)
const generateLocalSummary = (project) => {
  if (!project) return null;

  const milestones = project.milestones || [];
  const updates = project.updates || [];
  const completedMilestones = milestones.filter((m) => m.status === "COMPLETE");
  const inProgressMilestones = milestones.filter((m) => m.status === "IN_PROGRESS");
  const plannedMilestones = milestones.filter((m) => m.status === "PLANNED");

  let summary = `## Weekly Progress Report: ${project.name}\n\n`;
  summary += `**Homeowner:** ${project.user?.fullName || "N/A"}\n`;
  summary += `**Overall Progress:** ${project.completionPercentage}%\n`;
  summary += `**Report Period:** ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} — ${new Date().toLocaleDateString()}\n\n`;

  summary += `### Milestone Status\n`;
  summary += `- **Completed:** ${completedMilestones.length}/${milestones.length}\n`;
  summary += `- **In Progress:** ${inProgressMilestones.length}/${milestones.length}\n`;
  summary += `- **Upcoming:** ${plannedMilestones.length}/${milestones.length}\n\n`;

  if (inProgressMilestones.length > 0) {
    summary += `### Currently In Progress\n`;
    inProgressMilestones.forEach((m) => {
      summary += `- **${m.name}** — ${m.progress}% complete${m.description ? ` (${m.description})` : ""}\n`;
    });
    summary += "\n";
  }

  if (updates.length > 0) {
    summary += `### This Week's Updates (${updates.length})\n`;
    updates.forEach((u) => {
      summary += `- **${u.title}** (${new Date(u.createdAt).toLocaleDateString()})`;
      if (u.description) summary += `: ${u.description}`;
      summary += "\n";
    });
    summary += "\n";
  } else {
    summary += `### This Week's Updates\nNo new updates were posted this week.\n\n`;
  }

  // Next steps
  if (plannedMilestones.length > 0) {
    summary += `### What's Coming Next\n`;
    const next = plannedMilestones[0];
    summary += `- **${next.name}**${next.description ? ` — ${next.description}` : ""}`;
    if (next.date) summary += ` (Target: ${new Date(next.date).toLocaleDateString()})`;
    summary += "\n";
  }

  return summary;
};

// Helper: generate summary with OpenAI (if API key available)
const generateAISummary = async (project) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey });

    const milestones = project.milestones || [];
    const updates = project.updates || [];

    const prompt = `You are a construction project manager at UH Homes, a luxury home builder in Texas. Generate a professional, concise weekly progress summary email for a homeowner about their construction project.

Project: ${project.name}
Address: ${project.address || "N/A"}
Overall Progress: ${project.completionPercentage}%
Status: ${project.status}

Milestones:
${milestones.map((m) => `- ${m.name}: ${m.status} (${m.progress}%) - ${m.description || ""}`).join("\n")}

This Week's Updates:
${updates.length > 0 ? updates.map((u) => `- ${u.title}: ${u.description || ""} (${new Date(u.createdAt).toLocaleDateString()})`).join("\n") : "No updates this week."}

Write a friendly, professional summary including:
1. Key progress this week
2. Current phase details
3. What's coming next
4. Any items needing homeowner attention

Keep it under 300 words, warm but professional tone.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("OpenAI error:", error.message);
    return null;
  }
};

// POST /admin/ai-summary/generate/:projectId - Generate weekly summary for a project
const generateWeeklySummary = async (req, res) => {
  try {
    const project = await getWeeklyData(req.params.projectId);
    if (!project) {
      return res.status(404).json({ status: "error", message: "Project not found." });
    }

    // Try AI first, fallback to local
    let summary = await generateAISummary(project);
    const isAI = !!summary;

    if (!summary) {
      summary = generateLocalSummary(project);
    }

    res.json({
      status: "success",
      data: {
        projectId: project.id,
        projectName: project.name,
        homeowner: project.user?.fullName,
        summary,
        generatedWith: isAI ? "AI (GPT-4o-mini)" : "Rule-based",
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/ai-summary/send/:projectId - Generate + send summary via email
const sendWeeklySummary = async (req, res) => {
  try {
    const project = await getWeeklyData(req.params.projectId);
    if (!project) {
      return res.status(404).json({ status: "error", message: "Project not found." });
    }

    let summary = await generateAISummary(project);
    if (!summary) {
      summary = generateLocalSummary(project);
    }

    // Convert markdown-style to HTML
    const htmlSummary = summary
      .replace(/## (.*)/g, "<h2>$1</h2>")
      .replace(/### (.*)/g, "<h3>$1</h3>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/- (.*)/g, "<li>$1</li>")
      .replace(/\n/g, "<br>");

    await sendEmail({
      to: project.user?.email,
      subject: `Weekly Update: ${project.name} — ${new Date().toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #C5A572, #D4AF37); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">Weekly Construction Update</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">${project.name}</p>
          </div>
          <div style="background: #fff; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            <div style="line-height: 1.7; color: #333;">
              ${htmlSummary}
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
            <p style="color: #999; font-size: 11px; text-align: center;">
              UH Homes — Homes for today's lifestyle.<br>
              8580 Belleview Dr, Suite #100, Plano, TX 75024 | 214-619-9929
            </p>
          </div>
        </div>
      `,
    });

    // Also create an in-app alert
    await Alert.create({
      userId: project.userId,
      title: "Weekly Progress Summary",
      message: `Your weekly progress report for ${project.name} has been sent to your email.`,
      type: "INFO",
      channel: "EMAIL",
      read: false,
    });

    res.json({
      status: "success",
      message: `Summary sent to ${project.user?.email}`,
      data: { summary },
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/ai-summary/send-all - Generate + send summaries for all active projects
const sendAllWeeklySummaries = async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { status: "IN_PROGRESS" },
      include: [{ model: User, as: "user", attributes: ["id", "fullName", "email"] }],
    });

    let sent = 0;
    let failed = 0;

    for (const proj of projects) {
      try {
        const fullProject = await getWeeklyData(proj.id);
        let summary = await generateAISummary(fullProject);
        if (!summary) summary = generateLocalSummary(fullProject);

        const htmlSummary = summary
          .replace(/## (.*)/g, "<h2>$1</h2>")
          .replace(/### (.*)/g, "<h3>$1</h3>")
          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
          .replace(/- (.*)/g, "<li>$1</li>")
          .replace(/\n/g, "<br>");

        await sendEmail({
          to: proj.user?.email,
          subject: `Weekly Update: ${proj.name} — ${new Date().toLocaleDateString()}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #C5A572, #D4AF37); padding: 24px; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 22px;">Weekly Construction Update</h1>
              </div>
              <div style="background: #fff; padding: 28px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                ${htmlSummary}
              </div>
            </div>
          `,
        });

        await Alert.create({
          userId: proj.userId,
          title: "Weekly Progress Summary",
          message: `Your weekly report for ${proj.name} has been sent.`,
          type: "INFO",
          channel: "EMAIL",
          read: false,
        });

        sent++;
      } catch (err) {
        console.error(`Failed to send summary for project ${proj.id}:`, err.message);
        failed++;
      }
    }

    res.json({ status: "success", data: { sent, failed, total: projects.length } });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { generateWeeklySummary, sendWeeklySummary, sendAllWeeklySummaries };
