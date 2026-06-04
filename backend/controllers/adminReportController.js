const PDFDocument = require("pdfkit");
const { Project, Milestone, Update, User, Gallery, Media, Document } = require("../models");

// GET /admin/reports/project/:id - Generate PDF progress report
const generateProjectReport = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: ["fullName", "email", "phone"] },
        { model: Milestone, as: "milestones", order: [["order", "ASC"]] },
        { model: Update, as: "updates", include: [{ model: Media, as: "media" }], order: [["createdAt", "DESC"]], limit: 10 },
      ],
    });

    if (!project) {
      return res.status(404).json({ status: "error", message: "Project not found." });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${project.name.replace(/\s+/g, "_")}_Report.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("UH HOMES", { align: "center" });
    doc.fontSize(10).font("Helvetica").text("Construction Progress Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(8).fillColor("#666").text(`Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.moveDown(1);

    // Divider
    doc.strokeColor("#C5A572").lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Project Info
    doc.fillColor("#000").fontSize(16).font("Helvetica-Bold").text("Project Details");
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Project: ${project.name}`);
    doc.text(`Address: ${project.address || "N/A"}`);
    doc.text(`Status: ${project.status}`);
    doc.text(`Completion: ${project.completionPercentage}%`);
    doc.text(`Start Date: ${project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}`);
    doc.text(`Est. End Date: ${project.estimatedEndDate ? new Date(project.estimatedEndDate).toLocaleDateString() : "N/A"}`);
    doc.moveDown(0.5);

    // Progress Bar
    const barX = 50;
    const barY = doc.y;
    const barWidth = 200;
    const barHeight = 12;
    doc.rect(barX, barY, barWidth, barHeight).fillColor("#E5E7EB").fill();
    doc.rect(barX, barY, barWidth * (project.completionPercentage / 100), barHeight).fillColor("#C5A572").fill();
    doc.fillColor("#000").fontSize(9).text(`${project.completionPercentage}%`, barX + barWidth + 10, barY + 2);
    doc.moveDown(1.5);

    // Homeowner Info
    doc.fillColor("#000").fontSize(16).font("Helvetica-Bold").text("Homeowner");
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Name: ${project.user?.fullName || "N/A"}`);
    doc.text(`Email: ${project.user?.email || "N/A"}`);
    doc.text(`Phone: ${project.user?.phone || "N/A"}`);
    doc.moveDown(1);

    // Milestones
    if (project.milestones?.length > 0) {
      doc.fontSize(16).font("Helvetica-Bold").text("Construction Milestones");
      doc.moveDown(0.5);

      project.milestones.forEach((m, idx) => {
        const statusIcon = m.status === "COMPLETE" ? "✓" : m.status === "IN_PROGRESS" ? "●" : "○";
        const statusColor = m.status === "COMPLETE" ? "#16A34A" : m.status === "IN_PROGRESS" ? "#2563EB" : "#9CA3AF";

        doc.fillColor(statusColor).fontSize(11).font("Helvetica-Bold")
          .text(`${statusIcon} ${m.name}`, { continued: true });
        doc.fillColor("#666").font("Helvetica")
          .text(`  — ${m.status} (${m.progress}%)`, { continued: false });

        if (m.description) {
          doc.fillColor("#666").fontSize(9).text(`   ${m.description}`);
        }
        if (m.date) {
          doc.fillColor("#999").fontSize(8).text(`   Date: ${new Date(m.date).toLocaleDateString()}`);
        }
        doc.moveDown(0.3);
      });
      doc.moveDown(0.5);
    }

    // Recent Updates
    if (project.updates?.length > 0) {
      doc.addPage();
      doc.fillColor("#000").fontSize(16).font("Helvetica-Bold").text("Recent Updates");
      doc.moveDown(0.5);

      project.updates.forEach((u) => {
        doc.fillColor("#000").fontSize(11).font("Helvetica-Bold").text(u.title);
        doc.fillColor("#666").fontSize(9).font("Helvetica").text(u.description || "");
        doc.fillColor("#999").fontSize(8).text(`Date: ${new Date(u.createdAt).toLocaleDateString()}`);
        doc.moveDown(0.5);
      });
    }

    // Footer
    doc.moveDown(2);
    doc.strokeColor("#C5A572").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fillColor("#999").fontSize(8).font("Helvetica")
      .text("UH Homes — Homes for today's lifestyle. | 8580 Belleview Dr, Suite #100, Plano, TX 75024 | 214-619-9929", { align: "center" });

    doc.end();
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// GET /admin/reports/summary - Generate summary report of all projects
const generateSummaryReport = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: User, as: "user", attributes: ["fullName", "email"] },
        { model: Milestone, as: "milestones" },
      ],
      order: [["createdAt", "DESC"]],
    });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="UHHomes_Summary_Report_${new Date().toISOString().split("T")[0]}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("UH HOMES", { align: "center" });
    doc.fontSize(12).font("Helvetica").text("All Projects Summary Report", { align: "center" });
    doc.fontSize(8).fillColor("#666").text(`Generated: ${new Date().toLocaleDateString()}`, { align: "center" });
    doc.moveDown(1);
    doc.strokeColor("#C5A572").lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Stats
    const totalProjects = projects.length;
    const active = projects.filter((p) => p.status === "IN_PROGRESS").length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;

    doc.fillColor("#000").fontSize(14).font("Helvetica-Bold").text("Overview");
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica");
    doc.text(`Total Projects: ${totalProjects}`);
    doc.text(`Active: ${active}`);
    doc.text(`Completed: ${completed}`);
    doc.text(`Planned: ${totalProjects - active - completed}`);
    doc.moveDown(1);

    // Projects table
    doc.fontSize(14).font("Helvetica-Bold").text("Projects");
    doc.moveDown(0.5);

    projects.forEach((p, idx) => {
      doc.fillColor("#000").fontSize(11).font("Helvetica-Bold")
        .text(`${idx + 1}. ${p.name}`);
      doc.fillColor("#666").fontSize(9).font("Helvetica");
      doc.text(`   Owner: ${p.user?.fullName || "N/A"} | Status: ${p.status} | Progress: ${p.completionPercentage}%`);
      doc.text(`   Address: ${p.address || "N/A"}`);

      if (p.milestones?.length > 0) {
        const completedMilestones = p.milestones.filter((m) => m.status === "COMPLETE").length;
        doc.text(`   Milestones: ${completedMilestones}/${p.milestones.length} complete`);
      }
      doc.moveDown(0.5);
    });

    // Footer
    doc.moveDown(2);
    doc.strokeColor("#C5A572").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fillColor("#999").fontSize(8).font("Helvetica")
      .text("UH Homes — Homes for today's lifestyle. | 8580 Belleview Dr, Suite #100, Plano, TX 75024 | 214-619-9929", { align: "center" });

    doc.end();
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { generateProjectReport, generateSummaryReport };
