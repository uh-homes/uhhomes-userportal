/**
 * Syncs the Properties table with the UH Homes floor plan catalog
 * (data sourced from https://www.uhhomes.com/floor-plans/).
 * Safe to re-run: upserts by slug, never deletes anything.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const sequelize = require("../config/database");
const Property = require("../models/Property");

const catalog = [
  {
    name: "Vista",
    slug: "vista",
    location: "Prosper, TX",
    price: 920000,
    description:
      "Experience a home design where architectural presence meets everyday comfort. This plan features soaring ceilings, an open foyer, and seamless indoor-outdoor flow through generous covered patios—ideal for entertaining or quiet relaxation. With a private suite, guest room, study, prayer space, and expansive upstairs retreat, it adapts effortlessly to your lifestyle for years.",
    bedrooms: 5, bathrooms: 5, halfBathCount: 2, squareFeet: 5059, storyCount: 2, garageSpaces: 3,
    elevation: "https://www.uhhomes.com/wp-content/uploads/2026/03/exterior-ai-1771975839839-3.webp",
    thumbnail: "https://www.uhhomes.com/wp-content/uploads/2026/03/Vista-F1-1.webp",
    floorPlans: [
      { name: "Floor 1", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Vista-F1-1.webp" },
      { name: "Floor 2", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Vista-F2-1.webp" },
      { name: "Floor Plan PDF", url: "https://www.uhhomes.com/wp-content/uploads/2026/07/Vista.pdf" },
    ],
    features: ["Kitchen Island", "L-Shaped", "Walk-in Pantry", "Over-Sized Primary Suite Downstairs", "Guest Suite", "Second Floor Open Terrace", "3-Car Garage", "Grand Foyer", "Prayer Room", "Office Room", "Dining Area", "Media Room", "Butler's Pantry", "Game Room", "Second Living", "One Mud Room", "Elevator Provision"],
  },
  {
    name: "Utopia",
    slug: "utopia",
    location: "Prosper, TX",
    price: 860000,
    description:
      "Experience a home design where transitional elegance meets everyday comfort. The Utopia Plan centers on an open foyer and bright, connected living spaces—ideal for family time, entertaining, or working from home. With a prep kitchen, private suite, guest room, office, and covered patio, it adapts effortlessly as your lifestyle evolves for years.",
    bedrooms: 5, bathrooms: 5, halfBathCount: 2, squareFeet: 4580, storyCount: 2, garageSpaces: 3,
    elevation: "https://www.uhhomes.com/wp-content/uploads/2026/05/Utopia-Elev.webp",
    thumbnail: "https://www.uhhomes.com/wp-content/uploads/2026/03/Scott-Plan-Template-F1.webp",
    floorPlans: [
      { name: "Floor 1", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Scott-Plan-Template-F1.webp" },
      { name: "Floor 2", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Scott-Plan-Template-F2.webp" },
      { name: "Floor Plan PDF", url: "https://www.uhhomes.com/wp-content/uploads/2026/07/Utopia.pdf" },
    ],
    features: ["Kitchen Island", "L-Shaped", "Over-Sized Primary Suite Downstairs", "Over-Sized Master Closet", "Guest Suite", "3 Car Split Garage", "Second Kitchen", "Second Study", "Prayer Room", "Office Room", "Dining Area", "Butler's Pantry", "Game Room", "Media Room", "One Mud Room", "Secondary Laundry Upstairs"],
  },
  {
    name: "Velora",
    slug: "velora",
    location: "Prosper, TX",
    price: 880000,
    description:
      "Explore a home design that blends architectural finesse with everyday practicality. Our thoughtfully curated floorplans offer the perfect mix of open spaces and defined zones—ensuring flexibility for growing families, entertaining guests, or working remotely. Every inch is optimized for comfort, light, and flow, making each layout as livable as it is beautiful.",
    bedrooms: 5, bathrooms: 5, halfBathCount: 2, squareFeet: 5054, storyCount: 2, garageSpaces: 3,
    elevation: "https://www.uhhomes.com/wp-content/uploads/2026/03/Front-Elevation-1-2.webp",
    thumbnail: "https://www.uhhomes.com/wp-content/uploads/2026/03/Velora-F1-1-1.webp",
    floorPlans: [
      { name: "Floor 1", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Velora-F1-1-1.webp" },
      { name: "Floor 2", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Velora-F2-1-1.webp" },
      { name: "Floor Plan PDF", url: "https://www.uhhomes.com/wp-content/uploads/2026/07/Velora.pdf" },
    ],
    features: ["Kitchen Island", "L-Shaped", "Walk-In Pantry", "Over-Sized Primary Suite Downstairs", "His & Her Closet", "Guest Suite", "Second Floor Open Terrace", "3 Car Split Garage", "Grand Staircase", "Prep Kitchen", "Prayer Room", "Office Room", "Dining Area", "Butler's Pantry", "Game Room", "Media Room", "Two Mud Rooms", "Elevator Provision"],
  },
  {
    name: "Nexa",
    slug: "nexa",
    location: "Prosper, TX",
    price: 780000,
    description:
      "The Nexa Plan offers a timeless design crafted for both comfort and function. Spacious single-level living, wide-open gathering spaces, and thoughtfully placed private zones create the ideal blend for families and entertainers alike. Every detail is designed for ease and flexibility—making it as practical as it is inviting, both now and for years ahead.",
    bedrooms: 4, bathrooms: 4, halfBathCount: 1, squareFeet: 4396, storyCount: 1, garageSpaces: 3,
    elevation: "https://www.uhhomes.com/wp-content/uploads/2026/04/Ranch-Elevation-2-1.webp",
    thumbnail: "https://www.uhhomes.com/wp-content/uploads/2026/03/Ranch-Template.webp",
    floorPlans: [
      { name: "Floor Plan", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Ranch-Template.webp" },
      { name: "Floor Plan PDF", url: "https://www.uhhomes.com/wp-content/uploads/2026/07/Nexa.pdf" },
    ],
    features: ["Kitchen Island", "L-Shaped", "Walk-in Pantry", "Master Suite", "Guest Suite", "Covered Front Porch", "Outdoor Kitchen", "Outdoor Living Space", "3 Car Split Garage", "Covered Patio", "Prayer Room", "Study Room", "Butler's Pantry", "Dining Area", "Game Room", "Mud Room"],
  },
  {
    name: "Zyra",
    slug: "zyra",
    location: "Prosper, TX",
    price: 850000,
    description:
      "Experience a home design where modern elegance meets everyday comfort. The Zyra Plan features open-concept living areas balanced with private retreats—perfect for family time, entertaining, or working from home. With natural light, smart layouts, and seamless flow, the Zyra adapts effortlessly to your lifestyle today and as it evolves in the future.",
    bedrooms: 5, bathrooms: 5, halfBathCount: 2, squareFeet: 4263, storyCount: 2, garageSpaces: 3,
    elevation: "https://www.uhhomes.com/wp-content/uploads/2026/04/Zyra-Elevation-2-2.webp",
    thumbnail: "https://www.uhhomes.com/wp-content/uploads/2026/03/Zyra-Template-F1-1.webp",
    floorPlans: [
      { name: "Floor 1", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Zyra-Template-F1-1.webp" },
      { name: "Floor 2", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Zyra-Template-F2.webp" },
      { name: "Floor Plan PDF", url: "https://www.uhhomes.com/wp-content/uploads/2026/07/Zyra.pdf" },
    ],
    features: ["Kitchen Island", "L-Shaped", "Walk-in Pantry", "Master Suite Downstairs", "Guest Suite", "Covered Front Porch", "Outdoor Kitchen", "Outdoor Living Space", "Prayer Room", "Study Room", "Dining Area", "Game Room", "Courtyard", "Covered Patio", "Media Room Downstairs", "Second Floor Living Room", "3 Car Garage"],
  },
  {
    name: "Nirvaan",
    slug: "nirvaan",
    location: "Prosper, TX",
    price: 870000,
    description:
      "From the moment you enter, a dramatic open foyer and interior courtyard create a grand yet welcoming first impression. The heart of the home features a vaulted-ceiling living area with fireplace, seamlessly connected to a chef's kitchen, butler's pantry, wine cellar, and formal dining—ideal for both intimate gatherings and elevated entertaining.",
    bedrooms: 5, bathrooms: 5, halfBathCount: 2, squareFeet: 4395, storyCount: 2, garageSpaces: 3,
    elevation: "https://www.uhhomes.com/wp-content/uploads/2026/04/Nirvaan-Elevation-2.webp",
    thumbnail: "https://www.uhhomes.com/wp-content/uploads/2026/03/Nirvaan-F1-1-1.webp",
    floorPlans: [
      { name: "Floor 1", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Nirvaan-F1-1-1.webp" },
      { name: "Floor 2", url: "https://www.uhhomes.com/wp-content/uploads/2026/03/Nirvaan-F2-1-1.webp" },
      { name: "Floor Plan PDF", url: "https://www.uhhomes.com/wp-content/uploads/2026/05/Nirvaan-2.pdf" },
    ],
    features: ["Kitchen Island", "L-Shaped", "Prep Kitchen", "Over-Sized Primary Suite Downstairs", "Guest Suite", "Master Closet", "Additional Bedroom Downstairs", "Front Courtyard", "Tandem 3 Car Garage", "Open Foyer", "Office Room", "Dining Area", "Two Game Rooms", "Media Room", "One Mud Room"],
  },
];

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    for (const data of catalog) {
      const existing = await Property.findOne({ where: { slug: data.slug } });
      if (existing) {
        await existing.update(data);
        console.log(`${data.name}: ✅ Updated`);
      } else {
        await Property.create(data);
        console.log(`${data.name}: ✅ Created`);
      }
    }

    console.log("\n✅ Properties synced with uhhomes.com floor plan catalog.");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
