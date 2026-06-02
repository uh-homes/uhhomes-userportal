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

    // Create the primary user
    const user = await User.create({
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

    // Create project for user (saisowjanya218@gmail.com)
    const userProject = await Project.create({
      userId: user.id,
      name: "The Grand Oak Residence",
      address: "4521 Westheimer Rd, Houston, TX 77027",
      status: "IN_PROGRESS",
      completionPercentage: 62,
      startDate: new Date("2024-03-01"),
      estimatedEndDate: new Date("2025-09-15"),
    });

    // User project milestones
    await Milestone.bulkCreate([
      {
        projectId: userProject.id,
        name: "Site Preparation",
        description: "Land clearing, grading and utility connections",
        status: "COMPLETE",
        date: new Date("2024-03-15"),
        progress: 100,
        order: 1,
      },
      {
        projectId: userProject.id,
        name: "Foundation",
        description: "Concrete foundation pour and curing",
        status: "COMPLETE",
        date: new Date("2024-05-01"),
        progress: 100,
        order: 2,
      },
      {
        projectId: userProject.id,
        name: "Framing & Roofing",
        description: "Structural framing, trusses and roof installation",
        status: "COMPLETE",
        date: new Date("2024-07-20"),
        progress: 100,
        order: 3,
      },
      {
        projectId: userProject.id,
        name: "Electrical & Plumbing",
        description: "Rough-in electrical, plumbing and HVAC systems",
        status: "IN_PROGRESS",
        date: new Date("2024-09-10"),
        progress: 75,
        order: 4,
      },
      {
        projectId: userProject.id,
        name: "Interior Finishing",
        description: "Drywall, flooring, cabinetry and paint",
        status: "PLANNED",
        date: new Date("2025-02-01"),
        progress: 0,
        order: 5,
      },
      {
        projectId: userProject.id,
        name: "Final Inspection & Handover",
        description: "City inspection, punch list and key handover",
        status: "PLANNED",
        date: new Date("2025-09-01"),
        progress: 0,
        order: 6,
      },
    ]);

    // User project updates
    const userUpdate1 = await Update.create({
      projectId: userProject.id,
      title: "HVAC ductwork installation complete",
      description: "All supply and return ducts have been installed throughout the first and second floors. Insulation wrap applied per energy code requirements.",
    });

    const userUpdate2 = await Update.create({
      projectId: userProject.id,
      title: "Plumbing rough-in 90% done",
      description: "Main water lines, drain stacks, and gas lines are in place. Remaining work includes fixture stub-outs in the master bath.",
    });

    await Media.bulkCreate([
      {
        updateId: userUpdate1.id,
        url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600",
        type: "image",
      },
      {
        updateId: userUpdate2.id,
        url: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600",
        type: "image",
      },
    ]);

    // User project gallery - phase-wise construction photos
    const userGallery = await Gallery.create({
      projectId: userProject.id,
      caption: "Construction Progress",
    });

    await Media.bulkCreate([
      {
        galleryId: userGallery.id,
        url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600",
        type: "image",
      },
      {
        galleryId: userGallery.id,
        url: "https://images.unsplash.com/photo-1590274853856-f22d5ee3d228?w=600",
        type: "image",
      },
      {
        galleryId: userGallery.id,
        url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600",
        type: "image",
      },
      {
        galleryId: userGallery.id,
        url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600",
        type: "image",
      },
    ]);

    // User project documents
    await Document.bulkCreate([
      {
        projectId: userProject.id,
        name: "Architectural Plans",
        type: "BLUEPRINT",
        url: "https://example.com/docs/blueprint.pdf",
      },
      {
        projectId: userProject.id,
        name: "HOA Approval Letter",
        type: "PERMIT",
        url: "https://example.com/docs/hoa-approval.pdf",
      },
      {
        projectId: userProject.id,
        name: "Construction Contract",
        type: "CONTRACT",
        url: "https://example.com/docs/contract.pdf",
      },
    ]);

    // User alerts
    await Alert.bulkCreate([
      {
        userId: user.id,
        title: "Electrical inspection passed",
        message: "Your electrical rough-in passed city inspection. Proceeding to insulation phase.",
        type: "SUCCESS",
        channel: "IN_APP",
        read: false,
      },
      {
        userId: user.id,
        title: "Material delivery scheduled",
        message: "Hardwood flooring and tile shipment arriving Friday, Jan 10.",
        type: "INFO",
        channel: "IN_APP",
        read: false,
      },
      {
        userId: user.id,
        title: "Weather delay notice",
        message: "Exterior paint work postponed 2 days due to rain forecast.",
        type: "WARNING",
        channel: "EMAIL",
        read: false,
      },
    ]);

    // User favorites
    await Favorite.bulkCreate([
      { userId: user.id, propertyId: property1.id },
      { userId: user.id, propertyId: property2.id },
      { userId: user.id, propertyId: property3.id },
    ]);

    console.log("✅ Seed data created successfully!");
    console.log("\n--- Login Credentials ---");
    console.log("Admin: admin@uhhomes.com / Admin@uhHomes12");
    console.log("User:  saisowjanya218@gmail.com / User@123 (or Google login)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seed();
