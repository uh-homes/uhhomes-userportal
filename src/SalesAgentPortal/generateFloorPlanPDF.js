import { jsPDF } from "jspdf";
import logoWhite from "../assets/logowhite.png";

// UH Homes brand colors
const GOLD = [197, 165, 114]; // #C5A572
const DARK = [26, 26, 26]; // #1A1A1A
const GRAY = [100, 100, 100];
const WHITE = [255, 255, 255];

// Pre-load logo as base64 for PDF embedding
let logoDataUrl = null;
function getLogoDataUrl() {
  if (logoDataUrl) return Promise.resolve(logoDataUrl);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      logoDataUrl = canvas.toDataURL("image/png");
      resolve(logoDataUrl);
    };
    img.onerror = () => resolve(null);
    img.src = logoWhite;
  });
}

async function drawHeader(doc, planData) {
  // Dark header with centered logo only
  doc.setFillColor(...DARK);
  doc.rect(0, 0, 210, 35, "F");

  doc.setFillColor(...GOLD);
  doc.rect(0, 35, 210, 1.5, "F");

  // Add logo image - doubled size, centered
  const logo = await getLogoDataUrl();
  if (logo) {
    const logoW = 80;
    const logoH = 32;
    const logoX = (210 - logoW) / 2;
    doc.addImage(logo, "PNG", logoX, 2, logoW, logoH);
  } else {
    doc.setTextColor(...WHITE);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("UH HOMES", 105, 22, { align: "center" });
  }

  // Plan name and location BELOW the header
  let y = 44;
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text(planData.name, 20, y);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.text(`${planData.community} | ${planData.location}`, 190, y, { align: "right" });

  return y + 8;
}

function drawSpecsBar(doc, planData, y) {
  const specs = planData.specs;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, y, 180, 22, 3, 3, "F");

  const items = [
    `${specs.bedrooms} Bed`,
    `${specs.bathrooms} Bath`,
    specs.halfBaths ? `${specs.halfBaths} Half Bath` : null,
    `${specs.sqft} Sqft`,
    `${specs.stories} Story`,
    `${specs.garage} Garage`,
  ].filter(Boolean);

  const startX = 25;
  const spacing = 28;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);

  items.forEach((item, i) => {
    doc.text(item, startX + i * spacing, y + 13);
  });

  return y + 28;
}

function drawDescription(doc, planData, y) {
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  const lines = doc.splitTextToSize(planData.description, 170);
  doc.text(lines, 20, y);
  return y + lines.length * 5 + 8;
}

function drawSectionTitle(doc, title, y) {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(title, 20, y);

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(20, y + 2, 20 + doc.getTextWidth(title), y + 2);

  return y + 10;
}

function drawFeatureCategory(doc, title, items, x, y, maxWidth) {
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text(title, x, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY);
  doc.setFontSize(9);

  items.forEach((item) => {
    doc.setFillColor(...GOLD);
    doc.circle(x + 2, y - 1.2, 1, "F");
    const lines = doc.splitTextToSize(item, maxWidth - 8);
    doc.text(lines, x + 6, y);
    y += lines.length * 4.5 + 1.5;
  });

  return y + 4;
}

function drawDimensions(doc, planData, y) {
  const dims = planData.dimensions;
  if (!dims) return y;

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, y, 180, 30, 3, 3, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("Plan Dimensions", 25, y + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);

  let dimY = y + 14;
  if (dims.totalArea) {
    doc.text(`Total Area: ${dims.totalArea}`, 25, dimY);
    dimY += 5;
  }
  if (dims.firstFloor) {
    doc.text(`First Floor: ${dims.firstFloor}`, 25, dimY);
    dimY += 5;
  }
  if (dims.secondFloor) {
    doc.text(`Second Floor: ${dims.secondFloor}`, 25, dimY);
  }

  const specs = planData.specs;
  doc.text(`Bedrooms: ${specs.bedrooms}`, 120, y + 14);
  doc.text(`Bathrooms: ${specs.bathrooms}`, 120, y + 19);
  if (specs.halfBaths) {
    doc.text(`Half Baths: ${specs.halfBaths}`, 120, y + 24);
  }

  return y + 36;
}

function drawFooter(doc) {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(...DARK);
  doc.rect(0, pageHeight - 18, 210, 18, "F");

  doc.setTextColor(...GOLD);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("UH HOMES", 20, pageHeight - 8);

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("8580 Belleview Dr, Suite #100, Plano, TX 75024  |  214-619-9929  |  sales@uhhomes.com", 105, pageHeight - 8, { align: "center" });
  doc.text("www.uhhomes.com", 190, pageHeight - 8, { align: "right" });
}

function checkPageBreak(doc, y, neededSpace) {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + neededSpace > pageHeight - 25) {
    drawFooter(doc);
    doc.addPage();
    return 20;
  }
  return y;
}

async function embedImage(doc, imgUrl, y, label) {
  try {
    const img = await loadImage(imgUrl);
    const imgWidth = 170;
    const imgHeight = (img.height / img.width) * imgWidth;
    const clampedHeight = Math.min(imgHeight, 110);

    y = checkPageBreak(doc, y, clampedHeight + (label ? 8 : 4));

    if (label) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...GRAY);
      doc.text(label, 20, y);
      y += 5;
    }

    doc.addImage(img.dataUrl, "JPEG", 20, y, imgWidth, clampedHeight);
    y += clampedHeight + 6;
    return { y, success: true };
  } catch (err) {
    return { y, success: false };
  }
}

export async function generateFloorPlanCatalogPDF(planData) {
  const doc = new jsPDF("p", "mm", "a4");

  // Page 1: Header + Overview + Specs
  let y = await drawHeader(doc, planData);

  y = drawSpecsBar(doc, planData, y);
  y = drawDescription(doc, planData, y);

  // --- SECTION 1: Elevations (A, B, C) ---
  if (planData.elevationImages && planData.elevationImages.length > 0) {
    const elevationLabels = ["Elevation A", "Elevation B", "Elevation C", "Elevation D"];

    for (let i = 0; i < planData.elevationImages.length; i++) {
      y = checkPageBreak(doc, y, 80);
      y = drawSectionTitle(doc, elevationLabels[i] || `Elevation ${i + 1}`, y);

      const result = await embedImage(doc, planData.elevationImages[i], y, null);
      if (result.success) {
        y = result.y;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(...GRAY);
        doc.text("Elevation image available on the UH Homes website.", 20, y);
        y += 8;
      }
    }
  }

  // --- SECTION 2: Floor Plans ---
  if (planData.floorPlanImages && planData.floorPlanImages.length > 0) {
    y = checkPageBreak(doc, y, 80);
    y = drawSectionTitle(doc, "Floor Plans", y);

    for (let i = 0; i < planData.floorPlanImages.length; i++) {
      const label = planData.floorPlanImages.length > 1 ? `Floor ${i + 1}` : null;
      const result = await embedImage(doc, planData.floorPlanImages[i], y, label);
      if (result.success) {
        y = result.y;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(...GRAY);
        doc.text(`Floor plan ${i + 1} available at: ${planData.websiteUrl}`, 20, y);
        y += 8;
      }
    }
  }

  // --- SECTION 3: Features & Details ---
  y = checkPageBreak(doc, y, 60);
  y = drawSectionTitle(doc, "Features & Details", y);

  const features = planData.features;
  const colWidth = 82;
  const leftX = 20;
  const rightX = 110;

  let leftY = y;
  let rightY = y;

  if (features.kitchen && features.kitchen.length > 0) {
    leftY = drawFeatureCategory(doc, "Kitchen Features", features.kitchen, leftX, leftY, colWidth);
  }

  if (features.bedroom && features.bedroom.length > 0) {
    rightY = drawFeatureCategory(doc, "Bedroom Features", features.bedroom, rightX, rightY, colWidth);
  }

  y = Math.max(leftY, rightY) + 2;
  y = checkPageBreak(doc, y, 40);

  leftY = y;
  rightY = y;

  if (features.exterior && features.exterior.length > 0) {
    leftY = drawFeatureCategory(doc, "Exterior Features", features.exterior, leftX, leftY, colWidth);
  }

  if (features.additional && features.additional.length > 0) {
    rightY = drawFeatureCategory(doc, "Additional Features", features.additional, rightX, rightY, colWidth);
  }

  y = Math.max(leftY, rightY) + 4;

  // --- SECTION 4: Dimensions ---
  y = checkPageBreak(doc, y, 40);
  y = drawDimensions(doc, planData, y);

  // Website reference
  y = checkPageBreak(doc, y, 15);
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`More details: ${planData.websiteUrl}`, 20, y);

  // Footer on last page
  drawFooter(doc);

  // Save PDF
  doc.save(`UH_Homes_${planData.name}_Catalog.pdf`);
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    // Set a timeout to reject if image takes too long
    const timeout = setTimeout(() => {
      reject(new Error("Image load timeout"));
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement("canvas");
        // Limit resolution for PDF to keep file size reasonable
        const maxDim = 1600;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > maxDim) {
          h = (h / w) * maxDim;
          w = maxDim;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        resolve({ dataUrl, width: w, height: h });
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Image failed to load: " + url));
    };

    img.src = url;
  });
}

export default generateFloorPlanCatalogPDF;
