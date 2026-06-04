require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { sequelize, User, Project, Milestone, Update, Media, Gallery, Document, Alert, Property, Favorite } = require("../models");

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    // Sync all models
    await sequelize.sync({ force: true });
    console.log("Tables recreated.");

    // Create admin user
    const admin = await User.create({
      fullName: "Admin User",
      email: "admin@uhhomes.com",
      phone: "1234567890",
      password: "Admin@uhHomes12",
      role: "admin",
      isVerified: true,
    });
    console.log("✅ Admin user created: admin@uhhomes.com / Admin@uhHomes12");

    // Create homebuyer users
    const raviUser = await User.create({
      fullName: "Ravi Yarlagadda",
      email: "ravi@uhhomes.com",
      phone: "2145551001",
      password: "User@123",
      role: "user",
      isVerified: true,
    });
    console.log("✅ User created: ravi@uhhomes.com / User@123 (Velora plan)");

    const chinnaUser = await User.create({
      fullName: "Chinna",
      email: "chinna@uhhomes.com",
      phone: "2145551002",
      password: "User@123",
      role: "user",
      isVerified: true,
    });
    console.log("✅ User created: chinna@uhhomes.com / User@123 (Vista plan)");

    const sindhuraUser = await User.create({
      fullName: "Sindhura Chava",
      email: "sindhura@uhhomes.com",
      phone: "2145551003",
      password: "User@123",
      role: "user",
      isVerified: true,
    });
    console.log("✅ User created: sindhura@uhhomes.com / User@123 (Nirvaan plan)");

    const sowjanyaUser = await User.create({
      fullName: "Sai Sowjanya",
      email: "saisowjanya218@gmail.com",
      phone: "9876543210",
      password: "User@123",
      role: "user",
      isVerified: true,
    });
    console.log("✅ User created: saisowjanya218@gmail.com / User@123");

    // Create properties from UHHomes floorplans (uhhomes.com)
    const property1 = await Property.create({
      name: "Zyra",
      slug: "zyra",
      thumbnail: "https://www.uhhomes.com/wp-content/uploads/2026/03/Zyra-F1-2-scaled.jpg",
      price: 850000,
      location: "Prosper, TX",
      bedrooms: 5,
      bathrooms: 5,
      halfBathCount: 2,
      squareFeet: 4263,
      garageSpaces: 3,
      storyCount: 2,
      description: "Zyra at Park Place, Prosper TX — a masterclass in comfort, modern functionality, and architectural elegance. Features kitchen island, walk-in pantry, master suite downstairs, outdoor kitchen, prayer room, study room, game room, courtyard, and media room.",
      features: ["Kitchen Island", "Walk-in Pantry", "Master Suite Downstairs", "Guest Suite", "Outdoor Kitchen", "Prayer Room", "Study Room", "Game Room", "Courtyard", "Covered Patio", "Media Room", "3-Car Garage"],
      floorPlans: [
        { name: "Floor 1", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Zyra-F1-2-scaled.jpg" },
        { name: "Floor Plan PDF", url: "https://www.uhhomes.com/wp-content/uploads/2026/04/Zyra.pdf" },
      ],
    });

    const property2 = await Property.create({
      name: "Vista",
      slug: "vista",
      thumbnail: "https://www.uhhomes.com/wp-content/uploads/2026/03/Vista-F1-scaled.jpg",
      price: 920000,
      location: "Prosper, TX",
      bedrooms: 5,
      bathrooms: 5,
      halfBathCount: 2,
      squareFeet: 5059,
      garageSpaces: 3,
      storyCount: 2,
      description: "Vista at Park Place, Prosper TX — the largest floorplan offering over 5,000 sqft of luxurious living space with 5 bedrooms, 5 baths, and premium finishes throughout.",
      features: ["Kitchen Island", "Walk-in Pantry", "Master Suite Downstairs", "Guest Suite", "Outdoor Kitchen", "Study Room", "Game Room", "Covered Patio", "Media Room", "3-Car Garage"],
      floorPlans: [
        { name: "Floor 1", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Vista-F1-scaled.jpg" },
      ],
    });

    const property3 = await Property.create({
      name: "Velora",
      slug: "velora",
      thumbnail: "https://www.uhhomes.com/wp-content/uploads/2026/03/Velora-F1-scaled.jpg",
      price: 880000,
      location: "Prosper, TX",
      bedrooms: 5,
      bathrooms: 5,
      halfBathCount: 2,
      squareFeet: 5054,
      garageSpaces: 3,
      storyCount: 2,
      description: "Velora at Park Place, Prosper TX — 5,054+ sqft of elegant living with 5 bedrooms and 5 bathrooms. Crafted to fit every stage of your life with modern functionality.",
      features: ["Kitchen Island", "Walk-in Pantry", "Master Suite Downstairs", "Guest Suite", "Outdoor Kitchen", "Study Room", "Game Room", "Covered Patio", "3-Car Garage"],
      floorPlans: [
        { name: "Floor 1", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Velora-F1-scaled.jpg" },
      ],
    });

    const property4 = await Property.create({
      name: "Nexa",
      slug: "nexa",
      thumbnail: "https://www.uhhomes.com/wp-content/uploads/2026/03/Nexa-F1-scaled.jpg",
      price: 780000,
      location: "Prosper, TX",
      bedrooms: 4,
      bathrooms: 4,
      halfBathCount: 1,
      squareFeet: 4396,
      garageSpaces: 3,
      storyCount: 1,
      description: "Nexa at Park Place, Prosper TX — a single-story masterpiece with 4,396+ sqft. 4 bedrooms, 4 bathrooms, and all the space you need on one level.",
      features: ["Single Story", "Kitchen Island", "Walk-in Pantry", "Master Suite", "Outdoor Kitchen", "Study Room", "Covered Patio", "3-Car Garage"],
      floorPlans: [
        { name: "Floor 1", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Nexa-F1-scaled.jpg" },
      ],
    });

    const property5 = await Property.create({
      name: "Utopia",
      slug: "utopia",
      thumbnail: "https://www.uhhomes.com/wp-content/uploads/2026/03/Utopia-F1-scaled.jpg",
      price: 860000,
      location: "Prosper, TX",
      bedrooms: 5,
      bathrooms: 5,
      halfBathCount: 2,
      squareFeet: 4580,
      garageSpaces: 3,
      storyCount: 2,
      description: "Utopia at Park Place, Prosper TX — 4,580+ sqft of refined living. 5 bedrooms, 5 bathrooms with premium finishes and modern architecture.",
      features: ["Kitchen Island", "Walk-in Pantry", "Master Suite Downstairs", "Guest Suite", "Outdoor Kitchen", "Study Room", "Game Room", "Covered Patio", "3-Car Garage"],
      floorPlans: [
        { name: "Floor 1", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Utopia-F1-scaled.jpg" },
      ],
    });

    const property6 = await Property.create({
      name: "Nirvaan",
      slug: "nirvaan",
      thumbnail: "https://www.uhhomes.com/wp-content/uploads/2026/03/Nirvaan-F1-scaled.jpg",
      price: 870000,
      location: "Prosper, TX",
      bedrooms: 5,
      bathrooms: 5,
      halfBathCount: 2,
      squareFeet: 4395,
      garageSpaces: 3,
      storyCount: 2,
      description: "Nirvaan at Park Place, Prosper TX — 4,395+ sqft of sophisticated design. 5 bedrooms, 5 bathrooms with thoughtful layouts for modern families.",
      features: ["Kitchen Island", "Walk-in Pantry", "Master Suite Downstairs", "Guest Suite", "Outdoor Kitchen", "Study Room", "Covered Patio", "3-Car Garage"],
      floorPlans: [
        { name: "Floor 1", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Nirvaan-F1-scaled.jpg" },
      ],
    });

    // ===========================
    // PROJECT 1: Velora — Ravi Yarlagadda
    // ===========================
    const veloraProject = await Project.create({
      userId: raviUser.id,
      name: "Velora at Park Place",
      address: "Lot 12, Park Place, Prosper, TX 75078",
      status: "IN_PROGRESS",
      completionPercentage: 68,
      startDate: new Date("2024-06-01"),
      estimatedEndDate: new Date("2025-08-30"),
    });

    await Milestone.bulkCreate([
      { projectId: veloraProject.id, name: "Site Preparation", description: "Land clearing, grading, utility connections for Velora lot", status: "COMPLETE", date: new Date("2024-06-15"), progress: 100, order: 1 },
      { projectId: veloraProject.id, name: "Foundation", description: "Post-tension slab foundation pour and curing", status: "COMPLETE", date: new Date("2024-08-10"), progress: 100, order: 2 },
      { projectId: veloraProject.id, name: "Framing & Roofing", description: "2-story structural framing, trusses and architectural shingle roof", status: "COMPLETE", date: new Date("2024-10-20"), progress: 100, order: 3 },
      { projectId: veloraProject.id, name: "Electrical & Plumbing", description: "Rough-in electrical, plumbing, HVAC for 5,054 sqft layout", status: "IN_PROGRESS", date: new Date("2025-01-15"), progress: 80, order: 4 },
      { projectId: veloraProject.id, name: "Interior Finishing", description: "Drywall, flooring, cabinetry, paint — master suite and 4 bedrooms", status: "PLANNED", date: new Date("2025-04-01"), progress: 0, order: 5 },
      { projectId: veloraProject.id, name: "Exterior & Landscaping", description: "Stone/brick veneer, outdoor kitchen, covered patio, landscaping", status: "PLANNED", date: new Date("2025-06-15"), progress: 0, order: 6 },
      { projectId: veloraProject.id, name: "Final Inspection & Handover", description: "City of Prosper final inspection, punch list, key handover", status: "PLANNED", date: new Date("2025-08-30"), progress: 0, order: 7 },
    ]);

    const veloraUpdate1 = await Update.create({ projectId: veloraProject.id, title: "HVAC rough-in complete on both floors", description: "Supply and return ducts installed throughout both stories. Insulation wrap applied per Texas energy code. HVAC units staged in garage." });
    const veloraUpdate2 = await Update.create({ projectId: veloraProject.id, title: "Electrical panel installed", description: "200A main panel installed. Wiring run to all 5 bedrooms, kitchen island, outdoor kitchen, and study room. Low-voltage pre-wire for surround sound complete." });

    await Media.bulkCreate([
      { updateId: veloraUpdate1.id, url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600", type: "image" },
      { updateId: veloraUpdate2.id, url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600", type: "image" },
    ]);

    const veloraGallery1 = await Gallery.create({ projectId: veloraProject.id, phase: "Foundation", caption: "Post-tension slab pour" });
    const veloraGallery2 = await Gallery.create({ projectId: veloraProject.id, phase: "Framing & Roofing", caption: "Velora 2-story framing complete" });
    await Media.bulkCreate([
      { galleryId: veloraGallery1.id, url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600", type: "image" },
      { galleryId: veloraGallery1.id, url: "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=600", type: "image" },
      { galleryId: veloraGallery2.id, url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600", type: "image" },
      { galleryId: veloraGallery2.id, url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600", type: "image" },
    ]);

    await Document.bulkCreate([
      { projectId: veloraProject.id, name: "Velora Architectural Plans", type: "BLUEPRINT", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Velora-F1-scaled.jpg" },
      { projectId: veloraProject.id, name: "Park Place HOA Approval", type: "PERMIT", url: "https://example.com/docs/hoa-velora.pdf" },
      { projectId: veloraProject.id, name: "Construction Agreement — Ravi Yarlagadda", type: "CONTRACT", url: "https://example.com/docs/contract-velora.pdf" },
    ]);

    await Alert.bulkCreate([
      { userId: raviUser.id, title: "Electrical rough-in inspection passed", message: "Your Velora home electrical rough-in passed City of Prosper inspection. Moving to insulation phase.", type: "SUCCESS", channel: "IN_APP", read: false },
      { userId: raviUser.id, title: "Plumbing fixtures selected", message: "Your selections for Kohler fixtures have been confirmed. Delivery scheduled for next week.", type: "INFO", channel: "IN_APP", read: false },
      { userId: raviUser.id, title: "Bi-weekly update available", message: "New construction photos and progress update for Velora at Park Place are now available.", type: "INFO", channel: "EMAIL", read: false },
    ]);

    // ===========================
    // PROJECT 2: Vista — Chinna
    // ===========================
    const vistaProject = await Project.create({
      userId: chinnaUser.id,
      name: "Vista at Park Place",
      address: "Lot 8, Park Place, Prosper, TX 75078",
      status: "IN_PROGRESS",
      completionPercentage: 45,
      startDate: new Date("2024-09-01"),
      estimatedEndDate: new Date("2025-12-15"),
    });

    await Milestone.bulkCreate([
      { projectId: vistaProject.id, name: "Site Preparation", description: "Land clearing, grading, utility connections for Vista 5,059 sqft lot", status: "COMPLETE", date: new Date("2024-09-20"), progress: 100, order: 1 },
      { projectId: vistaProject.id, name: "Foundation", description: "Post-tension slab foundation — largest floorplan in Park Place", status: "COMPLETE", date: new Date("2024-11-10"), progress: 100, order: 2 },
      { projectId: vistaProject.id, name: "Framing & Roofing", description: "2-story structural framing for 5,059 sqft, architectural shingles", status: "IN_PROGRESS", date: new Date("2025-02-01"), progress: 60, order: 3 },
      { projectId: vistaProject.id, name: "Electrical & Plumbing", description: "Rough-in electrical, plumbing, HVAC systems for 5 bed / 5 bath", status: "PLANNED", date: new Date("2025-05-01"), progress: 0, order: 4 },
      { projectId: vistaProject.id, name: "Interior Finishing", description: "Drywall, flooring, cabinetry, paint — premium finishes throughout", status: "PLANNED", date: new Date("2025-08-01"), progress: 0, order: 5 },
      { projectId: vistaProject.id, name: "Exterior & Landscaping", description: "Stone/brick veneer, outdoor kitchen, media room, covered patio", status: "PLANNED", date: new Date("2025-10-15"), progress: 0, order: 6 },
      { projectId: vistaProject.id, name: "Final Inspection & Handover", description: "City of Prosper final inspection, punch list, key handover", status: "PLANNED", date: new Date("2025-12-15"), progress: 0, order: 7 },
    ]);

    const vistaUpdate1 = await Update.create({ projectId: vistaProject.id, title: "Second floor framing underway", description: "First floor walls and trusses complete. Second floor framing started — game room and media room walls going up this week." });
    const vistaUpdate2 = await Update.create({ projectId: vistaProject.id, title: "Roof decking 50% installed", description: "OSB roof decking being nailed down. Expect roofing felt and shingle work to start next week, weather permitting." });

    await Media.bulkCreate([
      { updateId: vistaUpdate1.id, url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600", type: "image" },
      { updateId: vistaUpdate2.id, url: "https://images.unsplash.com/photo-1513467535987-db81bc0d0222?w=600", type: "image" },
    ]);

    const vistaGallery1 = await Gallery.create({ projectId: vistaProject.id, phase: "Site Preparation", caption: "Vista lot grading" });
    const vistaGallery2 = await Gallery.create({ projectId: vistaProject.id, phase: "Foundation", caption: "Vista foundation pour" });
    await Media.bulkCreate([
      { galleryId: vistaGallery1.id, url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600", type: "image" },
      { galleryId: vistaGallery2.id, url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600", type: "image" },
      { galleryId: vistaGallery2.id, url: "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=600", type: "image" },
    ]);

    await Document.bulkCreate([
      { projectId: vistaProject.id, name: "Vista Architectural Plans", type: "BLUEPRINT", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Vista-F1-scaled.jpg" },
      { projectId: vistaProject.id, name: "Construction Agreement — Chinna", type: "CONTRACT", url: "https://example.com/docs/contract-vista.pdf" },
    ]);

    await Alert.bulkCreate([
      { userId: chinnaUser.id, title: "Framing inspection scheduled", message: "City of Prosper structural framing inspection set for next Tuesday. Please review submitted engineering docs.", type: "INFO", channel: "IN_APP", read: false },
      { userId: chinnaUser.id, title: "Foundation inspection passed", message: "Your Vista home foundation passed all city inspections. Framing crew is mobilizing.", type: "SUCCESS", channel: "IN_APP", read: false },
    ]);

    // ===========================
    // PROJECT 3: Nirvaan — Sindhura Chava
    // ===========================
    const nirvaanProject = await Project.create({
      userId: sindhuraUser.id,
      name: "Nirvaan at Park Place",
      address: "Lot 15, Park Place, Prosper, TX 75078",
      status: "IN_PROGRESS",
      completionPercentage: 25,
      startDate: new Date("2025-01-10"),
      estimatedEndDate: new Date("2026-04-30"),
    });

    await Milestone.bulkCreate([
      { projectId: nirvaanProject.id, name: "Site Preparation", description: "Land clearing, grading, utility connections for Nirvaan lot", status: "COMPLETE", date: new Date("2025-01-25"), progress: 100, order: 1 },
      { projectId: nirvaanProject.id, name: "Foundation", description: "Post-tension slab foundation pour and curing for 4,395 sqft", status: "IN_PROGRESS", date: new Date("2025-03-15"), progress: 50, order: 2 },
      { projectId: nirvaanProject.id, name: "Framing & Roofing", description: "2-story structural framing, trusses and roof installation", status: "PLANNED", date: new Date("2025-06-01"), progress: 0, order: 3 },
      { projectId: nirvaanProject.id, name: "Electrical & Plumbing", description: "Rough-in electrical, plumbing, HVAC for 5 bed / 5 bath layout", status: "PLANNED", date: new Date("2025-09-01"), progress: 0, order: 4 },
      { projectId: nirvaanProject.id, name: "Interior Finishing", description: "Drywall, flooring, cabinetry, paint throughout both stories", status: "PLANNED", date: new Date("2025-12-01"), progress: 0, order: 5 },
      { projectId: nirvaanProject.id, name: "Exterior & Landscaping", description: "Stone/brick veneer, covered patio, landscaping, driveway", status: "PLANNED", date: new Date("2026-02-15"), progress: 0, order: 6 },
      { projectId: nirvaanProject.id, name: "Final Inspection & Handover", description: "City of Prosper final inspection, punch list, key handover", status: "PLANNED", date: new Date("2026-04-30"), progress: 0, order: 7 },
    ]);

    const nirvaanUpdate1 = await Update.create({ projectId: nirvaanProject.id, title: "Foundation forms set", description: "Rebar grid and post-tension cables laid out. Form boards installed. Concrete pour scheduled for this Friday." });

    await Media.bulkCreate([
      { updateId: nirvaanUpdate1.id, url: "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=600", type: "image" },
    ]);

    const nirvaanGallery1 = await Gallery.create({ projectId: nirvaanProject.id, phase: "Site Preparation", caption: "Nirvaan lot cleared and graded" });
    await Media.bulkCreate([
      { galleryId: nirvaanGallery1.id, url: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600", type: "image" },
    ]);

    await Document.bulkCreate([
      { projectId: nirvaanProject.id, name: "Nirvaan Architectural Plans", type: "BLUEPRINT", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Nirvaan-F1-scaled.jpg" },
      { projectId: nirvaanProject.id, name: "Construction Agreement — Sindhura Chava", type: "CONTRACT", url: "https://example.com/docs/contract-nirvaan.pdf" },
    ]);

    await Alert.bulkCreate([
      { userId: sindhuraUser.id, title: "Foundation pour this Friday", message: "Your Nirvaan home foundation concrete pour is confirmed for Friday 8AM. Weather looks clear.", type: "INFO", channel: "IN_APP", read: false },
      { userId: sindhuraUser.id, title: "Welcome to UH Homes!", message: "Your Nirvaan at Park Place project has officially started. Track every milestone here.", type: "SUCCESS", channel: "IN_APP", read: false },
    ]);

    // ===========================
    // PROJECT 4: Zyra — Sai Sowjanya (existing test user)
    // ===========================
    const zyraProject = await Project.create({
      userId: sowjanyaUser.id,
      name: "Zyra at Park Place",
      address: "Lot 5, Park Place, Prosper, TX 75078",
      status: "IN_PROGRESS",
      completionPercentage: 82,
      startDate: new Date("2024-01-15"),
      estimatedEndDate: new Date("2025-06-30"),
    });

    await Milestone.bulkCreate([
      { projectId: zyraProject.id, name: "Site Preparation", description: "Land clearing, grading, utility connections for Zyra lot", status: "COMPLETE", date: new Date("2024-02-01"), progress: 100, order: 1 },
      { projectId: zyraProject.id, name: "Foundation", description: "Post-tension slab foundation pour and curing", status: "COMPLETE", date: new Date("2024-03-20"), progress: 100, order: 2 },
      { projectId: zyraProject.id, name: "Framing & Roofing", description: "2-story structural framing, trusses, roof for 4,263 sqft", status: "COMPLETE", date: new Date("2024-06-01"), progress: 100, order: 3 },
      { projectId: zyraProject.id, name: "Electrical & Plumbing", description: "Rough-in electrical, plumbing, HVAC — prayer room and courtyard wiring", status: "COMPLETE", date: new Date("2024-09-15"), progress: 100, order: 4 },
      { projectId: zyraProject.id, name: "Interior Finishing", description: "Drywall, flooring, cabinetry, paint — master suite, game room, media room", status: "IN_PROGRESS", date: new Date("2025-01-10"), progress: 65, order: 5 },
      { projectId: zyraProject.id, name: "Exterior & Landscaping", description: "Stone/brick veneer, outdoor kitchen, courtyard, covered patio, landscaping", status: "PLANNED", date: new Date("2025-04-15"), progress: 0, order: 6 },
      { projectId: zyraProject.id, name: "Final Inspection & Handover", description: "City of Prosper final inspection, punch list, key handover", status: "PLANNED", date: new Date("2025-06-30"), progress: 0, order: 7 },
    ]);

    const zyraUpdate1 = await Update.create({ projectId: zyraProject.id, title: "Kitchen cabinetry installed", description: "Custom kitchen island cabinetry and walk-in pantry shelving installed. Countertop templating scheduled for next week." });
    const zyraUpdate2 = await Update.create({ projectId: zyraProject.id, title: "Hardwood flooring 60% complete", description: "Engineered hardwood installed in master suite, study room, and main living areas. Game room and media room flooring next." });

    await Media.bulkCreate([
      { updateId: zyraUpdate1.id, url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600", type: "image" },
      { updateId: zyraUpdate2.id, url: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600", type: "image" },
    ]);

    const zyraGallery1 = await Gallery.create({ projectId: zyraProject.id, phase: "Framing & Roofing", caption: "Zyra framing and roof complete" });
    const zyraGallery2 = await Gallery.create({ projectId: zyraProject.id, phase: "Interior Finishing", caption: "Cabinetry and flooring in progress" });
    await Media.bulkCreate([
      { galleryId: zyraGallery1.id, url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600", type: "image" },
      { galleryId: zyraGallery1.id, url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600", type: "image" },
      { galleryId: zyraGallery2.id, url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600", type: "image" },
      { galleryId: zyraGallery2.id, url: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=600", type: "image" },
    ]);

    await Document.bulkCreate([
      { projectId: zyraProject.id, name: "Zyra Architectural Plans", type: "BLUEPRINT", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Zyra-F1-2-scaled.jpg" },
      { projectId: zyraProject.id, name: "Zyra Floor Plan PDF", type: "BLUEPRINT", url: "https://www.uhhomes.com/wp-content/uploads/2026/04/Zyra.pdf" },
      { projectId: zyraProject.id, name: "Construction Agreement — Sai Sowjanya", type: "CONTRACT", url: "https://example.com/docs/contract-zyra.pdf" },
    ]);

    await Alert.bulkCreate([
      { userId: sowjanyaUser.id, title: "Interior finishing on track", message: "Your Zyra home interior finishing is 65% complete. Kitchen cabinetry is in, flooring underway.", type: "SUCCESS", channel: "IN_APP", read: false },
      { userId: sowjanyaUser.id, title: "Countertop templating next week", message: "Granite countertop templating for kitchen island and master bath is scheduled for Monday.", type: "INFO", channel: "IN_APP", read: false },
      { userId: sowjanyaUser.id, title: "Bi-weekly update available", message: "New construction photos for Zyra at Park Place are available in your gallery.", type: "INFO", channel: "EMAIL", read: false },
    ]);

    // Favorites for Sowjanya
    await Favorite.bulkCreate([
      { userId: sowjanyaUser.id, propertyId: property1.id },
      { userId: sowjanyaUser.id, propertyId: property2.id },
      { userId: sowjanyaUser.id, propertyId: property3.id },
    ]);

    console.log("✅ Seed data created successfully!");
    console.log("\n--- Login Credentials ---");
    console.log("Admin:    admin@uhhomes.com / Admin@uhHomes12");
    console.log("Ravi:     ravi@uhhomes.com / User@123  (Velora plan)");
    console.log("Chinna:   chinna@uhhomes.com / User@123  (Vista plan)");
    console.log("Sindhura: sindhura@uhhomes.com / User@123  (Nirvaan plan)");
    console.log("Sowjanya: saisowjanya218@gmail.com / User@123  (Zyra plan)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();
