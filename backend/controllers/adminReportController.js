const PDFDocument = require("pdfkit");
const https = require("https");
const http = require("http");
const { Project, Milestone, Update, User, Gallery, Media, Document } = require("../models");

// Helper: fetch image from URL and return as buffer
const fetchImageBuffer = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        return fetchImageBuffer(response.headers.location).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to fetch image: ${response.statusCode}`));
      }
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    }).on("error", reject);
  });
};

// GET /admin/reports/project/:id - Generate PDF progress report
const generateProjectReport = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: "user", attributes: ["fullName", "email", "phone"] },
        { model: Milestone, as: "milestones", order: [["order", "ASC"]] },
        { model: Update, as: "updates", include: [{ model: Media, as: "media" }], order: [["createdAt", "DESC"]], limit: 10 },
        { model: Gallery, as: "gallery", include: [{ model: Media, as: "media" }] },
      ],
    });

    if (!project) {
      return res.status(404).json({ status: "error", message: "Project not found." });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${project.name.replace(/\s+/g, "_")}_Report.pdf"`);
    doc.pipe(res);

    // === BLACK HEADER STRIP WITH LOGO ===
    const headerHeight = 70;
    doc.rect(0, 0, 612, headerHeight).fill("#1A1A1A");
    doc.fillColor("#FFFFFF").fontSize(22).font("Helvetica-Bold")
      .text("UH HOMES", 0, 18, { align: "center", width: 612 });
    doc.fillColor("#C5A572").fontSize(9).font("Helvetica")
      .text("Construction Progress Report", 0, 44, { align: "center", width: 612 });
    doc.fillColor("#999").fontSize(7)
      .text(`Generated: ${new Date().toLocaleDateString()}`, 0, 57, { align: "center", width: 612 });

    doc.y = headerHeight + 20;

    // === PROJECT DETAILS & HOMEOWNER SIDE BY SIDE ===
    const leftX = 50;
    const rightX = 320;
    const sectionY = doc.y;

    // Left column — Project Details
    doc.fillColor("#1A1A1A").fontSize(12).font("Helvetica-Bold")
      .text("Project Details", leftX, sectionY);
    doc.moveDown(0.4);
    const projectInfoY = doc.y;
    doc.fillColor("#444").fontSize(9).font("Helvetica");
    doc.text(`Project:`, leftX, projectInfoY, { continued: true }).font("Helvetica-Bold").text(` ${project.name}`);
    doc.font("Helvetica").text(`Address: ${project.address || "N/A"}`, leftX);
    doc.text(`Status: ${project.status}`, leftX);
    doc.text(`Completion: ${project.completionPercentage}%`, leftX);
    doc.text(`Start Date: ${project.startDate ? new Date(project.startDate).toLocaleDateString() : "N/A"}`, leftX);
    doc.text(`Est. End Date: ${project.estimatedEndDate ? new Date(project.estimatedEndDate).toLocaleDateString() : "N/A"}`, leftX);

    // Right column — Homeowner
    doc.fillColor("#1A1A1A").fontSize(12).font("Helvetica-Bold")
      .text("Homeowner", rightX, sectionY);
    const ownerInfoY = sectionY + 18;
    doc.fillColor("#444").fontSize(9).font("Helvetica");
    doc.text(`Name: ${project.user?.fullName || "N/A"}`, rightX, ownerInfoY);
    doc.text(`Email: ${project.user?.email || "N/A"}`, rightX, ownerInfoY + 14);
    doc.text(`Phone: ${project.user?.phone || "N/A"}`, rightX, ownerInfoY + 28);

    // Move doc.y below both columns
    doc.y = Math.max(doc.y, ownerInfoY + 50);

    // Progress Bar
    const barX = 50;
    const barY = doc.y;
    const barWidth = 495;
    const barHeight = 10;
    doc.rect(barX, barY, barWidth, barHeight).fillColor("#E5E7EB").fill();
    doc.rect(barX, barY, barWidth * (project.completionPercentage / 100), barHeight).fillColor("#C5A572").fill();
    doc.fillColor("#000").fontSize(8).font("Helvetica")
      .text(`${project.completionPercentage}%`, barX + barWidth / 2 - 10, barY + 1);
    doc.y = barY + barHeight + 20;

    // Divider
    doc.strokeColor("#E5E7EB").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Milestones
    if (project.milestones?.length > 0) {
      doc.fontSize(16).font("Helvetica-Bold").text("Construction Milestones");
      doc.moveDown(0.5);

      project.milestones.forEach((m) => {
        const statusColor = m.status === "COMPLETE" ? "#16A34A" : m.status === "IN_PROGRESS" ? "#2563EB" : "#9CA3AF";
        const statusLabel = m.status === "COMPLETE" ? "COMPLETE" : m.status === "IN_PROGRESS" ? "IN PROGRESS" : "PLANNED";
        const bullet = m.status === "COMPLETE" ? "[DONE]" : m.status === "IN_PROGRESS" ? "[WIP]" : "[---]";

        doc.fillColor(statusColor).fontSize(11).font("Helvetica-Bold")
          .text(`${bullet}  ${m.name}`, 50, undefined, { continued: true });
        doc.fillColor("#444").font("Helvetica")
          .text(` -- ${statusLabel} (${m.progress}%)`, { continued: false });

        if (m.description) {
          doc.fillColor("#666").fontSize(9).text(`    ${m.description}`, 65);
        }
        if (m.date) {
          doc.fillColor("#999").fontSize(8).text(`    Date: ${new Date(m.date).toLocaleDateString()}`, 65);
        }
        doc.moveDown(0.4);
      });
      doc.moveDown(0.5);
    }

    // Project Photos
    const galleryImages = [];
    if (project.gallery?.length > 0) {
      project.gallery.forEach((g) => {
        g.media?.forEach((m) => {
          if (m.url && m.type === "image") galleryImages.push({ url: m.url, caption: g.caption || g.phase || "" });
        });
      });
    }
    // Also include images from updates
    if (project.updates?.length > 0) {
      project.updates.forEach((u) => {
        u.media?.forEach((m) => {
          if (m.url && m.type === "image") galleryImages.push({ url: m.url, caption: u.title || "" });
        });
      });
    }

    if (galleryImages.length > 0) {
      doc.addPage();
      doc.fillColor("#000").fontSize(16).font("Helvetica-Bold").text("Project Photos");
      doc.moveDown(0.5);

      // Fetch and embed up to 6 images
      const imagesToEmbed = galleryImages.slice(0, 6);
      for (let i = 0; i < imagesToEmbed.length; i++) {
        try {
          const imgBuffer = await fetchImageBuffer(imagesToEmbed[i].url);
          // Check if we need a new page
          if (doc.y > 550) doc.addPage();

          doc.image(imgBuffer, { fit: [240, 180], align: "center" });
          if (imagesToEmbed[i].caption) {
            doc.moveDown(0.2);
            doc.fillColor("#666").fontSize(8).font("Helvetica").text(imagesToEmbed[i].caption);
          }
          doc.moveDown(0.8);
        } catch (imgErr) {
          // Skip image if it fails to load
          doc.fillColor("#999").fontSize(8).text(`[Image unavailable: ${imagesToEmbed[i].caption || imagesToEmbed[i].url}]`);
          doc.moveDown(0.3);
        }
      }
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
