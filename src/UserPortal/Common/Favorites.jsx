import React, { useState, useEffect } from "react";
import { FaHeart, FaRegSadTear, FaDownload, FaSpinner } from "react-icons/fa";
import PropertyCard from "../../Product/ProductCard";
import api from "../../Api/api";
import { jsPDF } from "jspdf";
import { useSelector } from "react-redux";

const Favorites = () => {
  const favorites = useSelector((state) => state.wishlist);
  const [loadingById, setLoadingById] = useState({});
  const [error, setError] = useState(null);

  const formatPrice = (price) => {
    const num = Number(price);
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(Number.isFinite(num) ? num : 0);
  };

  const loadImage = (src) =>
    new Promise((resolve) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      } catch {
        resolve(null);
      }
    });
  const capitalizeText = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getImageType = (src = "") =>
    src.toLowerCase().includes(".png") ? "PNG" : "JPEG";

  // ✅ Shaddock-style Brochure PDF Generator (Full Layout, No Overlay)
  const downloadFloorplanPDF = async (propertyId) => {
    setLoadingById((prev) => ({ ...prev, [propertyId]: true }));

    try {
      const response = await api.get(`/properties/${propertyId}`);
      const property = response?.data?.data || {};

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      const logoUrl = new URL("../../assets/logo_uhhomes.webp", import.meta.url).href;

      // Fonts
      const headerFont = { name: "times", style: "bold", size: 22 };
      const subHeaderFont = { name: "times", style: "italic", size: 11 };
      const sectionTitleFont = { name: "times", style: "bold", size: 13 };
      const bodyFont = { name: "helvetica", style: "normal", size: 10 };
      const smallFont = { name: "helvetica", style: "normal", size: 8.5 };

      // Helpers
      const loadImage = (url) =>
        new Promise((resolve) => {
          if (!url) return resolve(null);
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = url;
        });

      const setFont = (font) => {
        doc.setFont(font.name, font.style);
        doc.setFontSize(font.size);
      };

      const drawDivider = (yPos) => {
        doc.setDrawColor(210);
        doc.setLineWidth(0.2);
        doc.line(margin, yPos, pageWidth - margin, yPos);
      };

      const addFooter = (totalPages) => {
        for (let p = 1; p <= totalPages; p++) {
          doc.setPage(p);
          doc.setFillColor(0, 0, 0);
          doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
          setFont(smallFont);
          doc.setTextColor(255);
          doc.text(
            `© UH Homes | Generated on ${new Date().toLocaleDateString()} | Page ${p} of ${totalPages}`,
            pageWidth - margin,
            pageHeight - 4,
            { align: "right" }
          );
        }
      };

      const addLogoHeader = async () => {
        const logo = await loadImage(logoUrl);
        if (logo) {
          const barHeight = 20;
          doc.setFillColor(0, 0, 0);
          doc.rect(0, 0, pageWidth, barHeight, "F");
          const w = 55;
          const h = (logo.height / logo.width) * w;
          const x = (pageWidth - w) / 2;
          const y = (barHeight - h) / 2 + 1;
          doc.addImage(logo, "PNG", x, y, w, h);
        }
      };

      // === PAGE 1 ===
      await addLogoHeader();

      let y = margin + 25;
      setFont(headerFont);
      doc.text(property.name || "Property Brochure", pageWidth / 2, y, {
        align: "center",
      });
      y += 8;

      if (property.location) {
        setFont(subHeaderFont);
        doc.text(property.location, pageWidth / 2, y, { align: "center" });
        y += 6;
      }

      drawDivider(y);
      y += 6;

      // Specs (from Dimensions or root fields)
      setFont(bodyFont);
      const specs = [];
      if (property.Dimension?.length) {
        property.Dimension.forEach((d) => {
          if (d.name && d.value) specs.push(`${d.name}: ${d.value}`);
        });
      }
      if (property.squareFeet) specs.push(`Sq Ft: ${property.squareFeet}`);
      if (property.garageSpaces) specs.push(`Garage: ${property.garageSpaces}`);
      if (property.storyCount) specs.push(`Stories: ${property.storyCount}`);
      if (property.halfBathCount)
        specs.push(`Half Baths: ${property.halfBathCount}`);
      if (property.price) specs.push(`Price: $${property.price}`);

      const colW = contentWidth / 2;
      specs.forEach((s, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        doc.text(s, margin + col * colW, y + row * 5);
      });
      y += Math.ceil(specs.length / 2) * 5 + 6;

      drawDivider(y);
      y += 6;

      // Features Section
      setFont(sectionTitleFont);
      doc.text("Features", margin, y);
      y += 6;
      setFont(bodyFont);

      let featuresList = [];
      if (Array.isArray(property.Feature)) {
        property.Feature.forEach((feature) => {
          if (feature.category && Array.isArray(feature.name)) {
            featuresList.push(`${feature.category}:`);
            feature.name.forEach((n) =>
              featuresList.push(
                capitalizeText(
                  `• ${n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()}`
                )
              )
            );
            featuresList.push("");
          }
        });
      }

      const left = featuresList.slice(0, Math.ceil(featuresList.length / 2));
      const right = featuresList.slice(Math.ceil(featuresList.length / 2));
      const colX = [margin, pageWidth / 2];
      const lineH = 4.5;

      for (let i = 0; i < Math.max(left.length, right.length); i++) {
        if (left[i]) doc.text(left[i], colX[0], y + i * lineH);
        if (right[i]) doc.text(right[i], colX[1], y + i * lineH);
      }
      y += Math.max(left.length, right.length) * lineH + 8;
      drawDivider(y);
      y += 8;

      // Elevation (Primary Image Only)
      if (property.elevations?.length) {
        const elevation = property.elevations[0];
        const frontImage =
          elevation.images?.find((img) => img.isPrimary) ||
          elevation.images?.[0];
        if (frontImage) {
          setFont(sectionTitleFont);
          doc.text("Elevation", margin, y);
          y += 8;

          const imgObj = await loadImage(frontImage.url);
          if (imgObj) {
            const availableHeight = pageHeight - y - 50;
            const aspectRatio = imgObj.height / imgObj.width;
            const imgW = contentWidth * 0.6;
            const imgH = Math.min(availableHeight, imgW * aspectRatio);
            doc.addImage(frontImage.url, "JPEG", margin, y, imgW, imgH);
            y += imgH + 6;

            setFont(subHeaderFont);
            doc.text(elevation.name || "A", pageWidth / 2, y, {
              align: "center",
            });
            y += 8;
          }
        }
        drawDivider(y);
        y += 8;
      }

      // === PAGE 2+: Floor Plans (2 Per Page Auto) ===
      const floors = property.floorPlans?.[0]?.floors || [];
      const spacingBetween = 4;
      const imgW = contentWidth * 0.7;
      const availableHeight = pageHeight - (margin + 25) - 50;
      const perImageHeight = (availableHeight - spacingBetween) / 2;
      let floorIndex = 0;
      let pageY;

      while (floorIndex < floors.length) {
        doc.addPage();
        await addLogoHeader();

        pageY = margin + 20;
        setFont(sectionTitleFont);
        doc.text(
          floorIndex === 0 ? "Floor Plans" : "Floor Plans (Continued)",
          pageWidth / 2,
          pageY,
          { align: "center" }
        );
        pageY += 10;

        for (
          let i = 0;
          i < 2 && floorIndex < floors.length;
          i++, floorIndex++
        ) {
          const f = floors[floorIndex];
          const img = await loadImage(f.baseImageUrl);
          if (!img) continue;

          const ratio = img.height / img.width;
          const drawH = Math.min(perImageHeight, imgW * ratio);
          doc.addImage(f.baseImageUrl, "JPEG", margin, pageY, imgW, drawH);

          // Label inside bottom of image
          const labelY = pageY + drawH - 6;
          // doc.setFillColor(255, 255, 255);
          // doc.rect(margin, labelY - 4, imgW, 8, "F");
          setFont(subHeaderFont);
          doc.setTextColor(0);
          doc.text(
            f.label || `Floor ${floorIndex + 1}`,
            margin + imgW / 2,
            labelY + 2,
            {
              align: "center",
            }
          );

          pageY += drawH + spacingBetween;
        }

        // Disclaimer only on the last page
        if (floorIndex >= floors.length) {
          drawDivider(pageY);
          pageY += 8;
          setFont(smallFont);
          const disclaimer =
            "All Product including Architectural Designs ©2000-2025, UH Homes, LTD., All rights reserved. There may be existing or future design changes made in the floorplans, materials, methods, or designs not reflected in this brochure. Prices, plans, and details subject to change without notice. Renderings are conceptual. All rights reserved.";
          const lines = doc.splitTextToSize(disclaimer, contentWidth);
          lines.forEach((line, i) => {
            doc.text(line.trim(), margin, pageY + i * 4.5, {
              align: "justify",
            });
          });
        }
      }

      const totalPages = doc.internal.getNumberOfPages();
      addFooter(totalPages);

      const fileName = `${(property.name || "property")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_brochure.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to generate PDF document");
    } finally {
      setLoadingById((prev) => ({ ...prev, [propertyId]: false }));
    }
  };

  if (Object.values(loadingById).some(Boolean) && favorites.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-800">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FaHeart className="text-2xl text-red-600 mr-3" />
            <h1 className="text-2xl text-gray-800">My Favorites</h1>
            <span className="ml-3 bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded-full">
              {favorites.length} properties
            </span>
          </div>
        </div>
      </div>

      {/* Favorites List */}
      <div className="flex-1 overflow-y-auto p-6">
        {favorites.length === 0 ? (
          <div className="text-center py-12">
            <FaRegSadTear className="text-4xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg text-gray-800 mb-2">No favorites yet</h3>
            <p className="text-gray-500">
              Start saving your favorite properties by clicking the heart icon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const property = favorite.property;
              const mainImage = property?.elevation || property?.thumbnail;
              return (
                <div key={property.id} className="relative">
                  <PropertyCard
                    id={property.id}
                    thumbnail={property?.thumbnail}
                    elevation={property?.elevation}
                    name={property?.name || "Unnamed Property"}
                    price={formatPrice(property?.price || 0)}
                    location={property?.location || "Address not available"}
                    bedrooms={property?.bedrooms || 0}
                    bathrooms={property?.bathrooms || 0}
                    halfBathCount={property?.halfBathCount || 0}
                    squareFeet={property?.squareFeet || 0}
                    garageSpaces={property?.garageSpaces || 0}
                    storyCount={property?.storyCount || 0}
                  />
                  {/* Download PDF button for each property */}
                  <button
                    onClick={() => downloadFloorplanPDF(property.id)}
                    className="absolute top-14 right-3 px-2 py-2 bg-gradient text-white rounded-full flex items-center gap-2 z-10 cursor-pointer"
                  >
                    {loadingById[property.id] ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <FaDownload />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
