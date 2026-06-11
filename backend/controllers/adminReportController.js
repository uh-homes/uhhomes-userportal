const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
const { Project, Milestone, Update, User, Gallery, Media, Document } = require("../models");

// Helper: fetch image from URL and return as buffer
const fetchImageBuffer = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
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

// Colors
const GOLD = "#C5A572";
const DARK = "#1A1A1A";
const GRAY_700 = "#374151";
const GRAY_500 = "#6B7280";
const GRAY_400 = "#9CA3AF";
const GRAY_200 = "#E5E7EB";
const GREEN = "#16A34A";
const BLUE = "#2563EB";
const WHITE = "#FFFFFF";

// Page dimensions
const PAGE_W = 612;
const MARGIN = 50;
const CONTENT_W = PAGE_W - MARGIN * 2;

// Logo path
const LOGO_PATH = path.join(__dirname, "../../src/assets/logowhite.png");

// Helper: draw page footer
const drawFooter = (doc) => {
  const footerY = 760;
  doc.strokeColor(GRAY_200).lineWidth(0.5).moveTo(MARGIN, footerY).lineTo(PAGE_W - MARGIN, footerY).stroke();
  doc.fillColor(GRAY_400).fontSize(7).font("Helvetica")
    .text("UH Homes  |  8580 Belleview Dr, Suite #100, Plano, TX 75024  |  214-619-9929  |  www.uhhomes.com", MARGIN, footerY + 8, { align: "center", width: CONTENT_W });
  doc.fillColor(GRAY_400).fontSize(6)
    .text("This report is confidential and intended for the homeowner only.", MARGIN, footerY + 20, { align: "center", width: CONTENT_W });
};

// Helper: draw header with logo and gold accent
const drawHeader = (doc, subtitle) => {
  const headerH = 80;
  doc.rect(0, 0, PAGE_W, headerH).fill(DARK);
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, MARGIN, 16, { height: 48 });
  } else {
    doc.fillColor(WHITE).fontSize(24).font("Helvetica-Bold").text("UH HOMES", MARGIN, 24);
  }
  doc.fillColor(GOLD).fontSize(11).font("Helvetica-Bold")
    .text(subtitle || "Construction Progress Report", 0, 28, { align: "right", width: PAGE_W - MARGIN });
  doc.fillColor(GRAY_400).fontSize(8).font("Helvetica")
    .text(`Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`, 0, 44, { align: "right", width: PAGE_W - MARGIN });
  doc.rect(0, headerH, PAGE_W, 3).fill(GOLD);
  return headerH + 24;
};

// Helper: draw section header with gold accent line
const drawSectionHeader = (doc, title, y) => {
  const startY = y || doc.y;
  doc.fillColor(DARK).fontSize(14).font("Helvetica-Bold").text(title, MARGIN, startY);
  doc.strokeColor(GOLD).lineWidth(2).moveTo(MARGIN, startY + 18).lineTo(MARGIN + 50, startY + 18).stroke();
  doc.y = startY + 28;
};

// Helper: check page space, add page if needed
const ensureSpace = (doc, needed) => {
  if (doc.y + needed > 740) {
    doc.addPage();
    drawFooter(doc);
    doc.y = 50;
    return true;
  }
  return false;
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

    const doc = new PDFDocument({ margin: MARGIN, size: "letter" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${project.name.replace(/\s+/g, "_")}_Report.pdf"`);
    doc.pipe(res);

    // ============================================================
    // PAGE 1: HEADER + PROJECT OVERVIEW
    // ============================================================
    doc.y = drawHeader(doc, "Construction Progress Report");
    drawFooter(doc);

    // --- Project Details & Homeowner — Two column card ---
    const cardY = doc.y;
    const cardH = 110;
    doc.save();
    doc.roundedRect(MARGIN, cardY, CONTENT_W, cardH, 6).fillAndStroke("#F9F7F4", GRAY_200);
    doc.restore();

    const colLeft = MARGIN + 20;
    const colRight = PAGE_W / 2 + 20;
    let infoY = cardY + 16;

    // Left: Project Details
    doc.fillColor(DARK).fontSize(10).font("Helvetica-Bold").text("Project Details", colLeft, infoY);
    infoY += 18;

    const projectFields = [
      ["Project", project.name],
      ["Address", project.address || "N/A"],
      ["Status", project.status.replace(/_/g, " ")],
      ["Start Date", project.startDate ? new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"],
      ["Est. Completion", project.estimatedEndDate ? new Date(project.estimatedEndDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"],
    ];
    projectFields.forEach(([label, value]) => {
      doc.font("Helvetica").fillColor(GRAY_500).fontSize(9).text(label + ":", colLeft, infoY, { continued: true, width: 250 });
      doc.font("Helvetica-Bold").fillColor(GRAY_700).text("  " + value);
      infoY += 14;
    });

    // Right: Homeowner
    let ownerY = cardY + 16;
    doc.fillColor(DARK).fontSize(10).font("Helvetica-Bold").text("Homeowner", colRight, ownerY);
    ownerY += 18;
    const ownerFields = [
      ["Name", project.user?.fullName || "N/A"],
      ["Email", project.user?.email || "N/A"],
      ["Phone", project.user?.phone || "N/A"],
    ];
    ownerFields.forEach(([label, value]) => {
      doc.font("Helvetica").fillColor(GRAY_500).fontSize(9).text(label + ":", colRight, ownerY, { continued: true, width: 220 });
      doc.font("Helvetica-Bold").fillColor(GRAY_700).text("  " + value);
      ownerY += 14;
    });

    doc.y = cardY + cardH + 20;

    // --- Overall Progress Bar ---
    const pct = project.completionPercentage || 0;
    doc.fillColor(DARK).fontSize(10).font("Helvetica-Bold").text("Overall Progress", MARGIN, doc.y);
    doc.fillColor(GRAY_500).fontSize(10).font("Helvetica-Bold")
      .text(`${pct}%`, 0, doc.y - 14, { align: "right", width: PAGE_W - MARGIN });
    doc.y += 6;
    const barY = doc.y;
    const barH = 12;
    doc.save();
    doc.roundedRect(MARGIN, barY, CONTENT_W, barH, 6).fill(GRAY_200);
    doc.roundedRect(MARGIN, barY, Math.max(CONTENT_W * (pct / 100), 12), barH, 6).fill(GOLD);
    doc.restore();

    doc.y = barY + barH + 28;

    // --- Milestones Section ---
    if (project.milestones?.length > 0) {
      drawSectionHeader(doc, "Construction Milestones");
      doc.y += 4;

      project.milestones.forEach((m, idx) => {
        ensureSpace(doc, 50);
        const rowY = doc.y;
        const isComplete = m.status === "COMPLETE";
        const isWIP = m.status === "IN_PROGRESS";
        const dotColor = isComplete ? GREEN : isWIP ? BLUE : GRAY_400;
        const statusLabel = isComplete ? "Complete" : isWIP ? "In Progress" : "Planned";

        // Status dot
        doc.save();
        doc.circle(MARGIN + 6, rowY + 6, 5).fill(dotColor);
        if (isComplete) {
          doc.fillColor(WHITE).fontSize(7).font("Helvetica-Bold").text("✓", MARGIN + 2.5, rowY + 2);
        }
        doc.restore();

        // Milestone name
        doc.fillColor(DARK).fontSize(10).font("Helvetica-Bold").text(m.name, MARGIN + 20, rowY, { width: 280 });

        // Status badge
        const badgeBg = isComplete ? "#DCFCE7" : isWIP ? "#DBEAFE" : "#F3F4F6";
        const badgeText = isComplete ? GREEN : isWIP ? BLUE : GRAY_500;
        const badgeW = 75;
        const badgeX = PAGE_W - MARGIN - badgeW;
        doc.save();
        doc.roundedRect(badgeX, rowY - 1, badgeW, 16, 8).fill(badgeBg);
        doc.fillColor(badgeText).fontSize(7).font("Helvetica-Bold")
          .text(statusLabel + (m.progress > 0 && !isComplete ? ` ${m.progress}%` : ""), badgeX, rowY + 2, { width: badgeW, align: "center" });
        doc.restore();

        // Description
        if (m.description) {
          doc.fillColor(GRAY_500).fontSize(8).font("Helvetica").text(m.description, MARGIN + 20, rowY + 16, { width: 380 });
        }

        // Date
        if (m.date) {
          const dateStr = new Date(m.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
          doc.fillColor(GRAY_400).fontSize(7).font("Helvetica").text(dateStr, MARGIN + 20, doc.y + 2);
        }

        doc.y += 12;
        if (idx < project.milestones.length - 1) {
          doc.strokeColor(GRAY_200).lineWidth(0.5).moveTo(MARGIN + 20, doc.y).lineTo(PAGE_W - MARGIN, doc.y).stroke();
          doc.y += 8;
        }
      });
    }

    // --- Project Photos ---
    const galleryImages = [];
    if (project.gallery?.length > 0) {
      project.gallery.forEach((g) => {
        g.media?.forEach((m) => {
          if (m.url && m.type === "image") galleryImages.push({ url: m.url, caption: g.caption || g.phase || "" });
        });
      });
    }
    if (project.updates?.length > 0) {
      project.updates.forEach((u) => {
        u.media?.forEach((m) => {
          if (m.url && m.type === "image") galleryImages.push({ url: m.url, caption: u.title || "" });
        });
      });
    }

    if (galleryImages.length > 0) {
      doc.addPage();
      drawFooter(doc);
      drawSectionHeader(doc, "Project Photos");
      doc.y += 8;

      const imagesToEmbed = galleryImages.slice(0, 8);
      const imgW = (CONTENT_W - 20) / 2;
      const imgH = 160;

      for (let i = 0; i < imagesToEmbed.length; i += 2) {
        ensureSpace(doc, imgH + 30);
        const rowY = doc.y;

        for (let j = 0; j < 2 && (i + j) < imagesToEmbed.length; j++) {
          const xPos = MARGIN + j * (imgW + 20);
          try {
            const imgBuffer = await fetchImageBuffer(imagesToEmbed[i + j].url);
            doc.save();
            doc.roundedRect(xPos, rowY, imgW, imgH, 6).clip();
            doc.image(imgBuffer, xPos, rowY, { width: imgW, height: imgH });
            doc.restore();
            if (imagesToEmbed[i + j].caption) {
              doc.fillColor(GRAY_500).fontSize(7).font("Helvetica")
                .text(imagesToEmbed[i + j].caption, xPos, rowY + imgH + 4, { width: imgW, align: "center" });
            }
          } catch (imgErr) {
            doc.save();
            doc.roundedRect(xPos, rowY, imgW, imgH, 6).fillAndStroke("#F9FAFB", GRAY_200);
            doc.restore();
            doc.fillColor(GRAY_400).fontSize(8).font("Helvetica")
              .text("Image unavailable", xPos, rowY + imgH / 2 - 5, { width: imgW, align: "center" });
          }
        }
        doc.y = rowY + imgH + 24;
      }
    }

    // --- Recent Updates ---
    if (project.updates?.length > 0) {
      doc.addPage();
      drawFooter(doc);
      drawSectionHeader(doc, "Recent Updates");
      doc.y += 4;

      project.updates.forEach((u, idx) => {
        ensureSpace(doc, 60);
        const rowY = doc.y;

        // Date badge
        const dateStr = new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        doc.save();
        doc.roundedRect(MARGIN, rowY, 70, 16, 8).fill("#F3F4F6");
        doc.fillColor(GRAY_500).fontSize(7).font("Helvetica-Bold")
          .text(dateStr, MARGIN, rowY + 3, { width: 70, align: "center" });
        doc.restore();

        // Title
        doc.fillColor(DARK).fontSize(10).font("Helvetica-Bold").text(u.title, MARGIN + 80, rowY, { width: CONTENT_W - 80 });

        // Description
        if (u.description) {
          doc.fillColor(GRAY_500).fontSize(8).font("Helvetica").text(u.description, MARGIN + 80, doc.y + 2, { width: CONTENT_W - 80 });
        }

        doc.y += 10;
        if (idx < project.updates.length - 1) {
          doc.strokeColor(GRAY_200).lineWidth(0.5).moveTo(MARGIN, doc.y).lineTo(PAGE_W - MARGIN, doc.y).stroke();
          doc.y += 10;
        }
      });
    }

    drawFooter(doc);
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

    const doc = new PDFDocument({ margin: MARGIN, size: "letter" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="UHHomes_Summary_Report_${new Date().toISOString().split("T")[0]}.pdf"`);
    doc.pipe(res);

    // Header
    doc.y = drawHeader(doc, "All Projects Summary Report");
    drawFooter(doc);

    // Stats card
    const totalProjects = projects.length;
    const active = projects.filter((p) => p.status === "IN_PROGRESS").length;
    const completed = projects.filter((p) => p.status === "COMPLETED").length;
    const planned = totalProjects - active - completed;

    const statsCardY = doc.y;
    const statsCardH = 60;
    doc.save();
    doc.roundedRect(MARGIN, statsCardY, CONTENT_W, statsCardH, 6).fillAndStroke("#F9F7F4", GRAY_200);
    doc.restore();

    const statW = CONTENT_W / 4;
    const stats = [
      { label: "Total", value: totalProjects, color: DARK },
      { label: "Active", value: active, color: BLUE },
      { label: "Completed", value: completed, color: GREEN },
      { label: "Planned", value: planned, color: GRAY_400 },
    ];
    stats.forEach((s, i) => {
      const x = MARGIN + i * statW;
      doc.fillColor(s.color).fontSize(20).font("Helvetica-Bold")
        .text(String(s.value), x, statsCardY + 12, { width: statW, align: "center" });
      doc.fillColor(GRAY_500).fontSize(8).font("Helvetica")
        .text(s.label, x, statsCardY + 36, { width: statW, align: "center" });
    });

    doc.y = statsCardY + statsCardH + 24;

    // Projects list
    drawSectionHeader(doc, "Projects");
    doc.y += 4;

    projects.forEach((p, idx) => {
      ensureSpace(doc, 65);
      const rowY = doc.y;

      // Project number circle
      doc.save();
      doc.circle(MARGIN + 10, rowY + 8, 10).fill(GOLD);
      doc.fillColor(WHITE).fontSize(9).font("Helvetica-Bold")
        .text(String(idx + 1), MARGIN + 2, rowY + 4, { width: 16, align: "center" });
      doc.restore();

      // Project name
      doc.fillColor(DARK).fontSize(11).font("Helvetica-Bold")
        .text(p.name, MARGIN + 28, rowY, { width: 300 });

      // Status badge
      const isActive = p.status === "IN_PROGRESS";
      const isDone = p.status === "COMPLETED";
      const badgeBg = isDone ? "#DCFCE7" : isActive ? "#DBEAFE" : "#F3F4F6";
      const badgeColor = isDone ? GREEN : isActive ? BLUE : GRAY_500;
      const badgeLabel = p.status.replace(/_/g, " ");
      const badgeW = 80;
      const badgeX = PAGE_W - MARGIN - badgeW;
      doc.save();
      doc.roundedRect(badgeX, rowY, badgeW, 16, 8).fill(badgeBg);
      doc.fillColor(badgeColor).fontSize(7).font("Helvetica-Bold")
        .text(badgeLabel, badgeX, rowY + 3, { width: badgeW, align: "center" });
      doc.restore();

      // Details
      doc.fillColor(GRAY_500).fontSize(8).font("Helvetica")
        .text(`Owner: ${p.user?.fullName || "N/A"}  |  Address: ${p.address || "N/A"}`, MARGIN + 28, rowY + 16, { width: 400 });

      // Progress mini-bar
      const miniBarY = doc.y + 6;
      const miniBarW = 200;
      doc.save();
      doc.roundedRect(MARGIN + 28, miniBarY, miniBarW, 6, 3).fill(GRAY_200);
      doc.roundedRect(MARGIN + 28, miniBarY, Math.max(miniBarW * (p.completionPercentage / 100), 6), 6, 3).fill(GOLD);
      doc.restore();
      doc.fillColor(GRAY_700).fontSize(7).font("Helvetica-Bold")
        .text(`${p.completionPercentage}%`, MARGIN + 28 + miniBarW + 8, miniBarY - 1);

      if (p.milestones?.length > 0) {
        const completedMs = p.milestones.filter((m) => m.status === "COMPLETE").length;
        doc.fillColor(GRAY_400).fontSize(7).font("Helvetica")
          .text(`Milestones: ${completedMs}/${p.milestones.length}`, MARGIN + 28 + miniBarW + 50, miniBarY - 1);
      }

      doc.y = miniBarY + 16;

      if (idx < projects.length - 1) {
        doc.strokeColor(GRAY_200).lineWidth(0.5).moveTo(MARGIN, doc.y).lineTo(PAGE_W - MARGIN, doc.y).stroke();
        doc.y += 10;
      }
    });

    drawFooter(doc);
    doc.end();
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { generateProjectReport, generateSummaryReport };
