const { Gallery, Media, Project, Milestone, User } = require("../models");

// GET /admin/gallery/:projectId - Get all galleries for a project grouped by phase
const getProjectGallery = async (req, res) => {
  try {
    const galleries = await Gallery.findAll({
      where: { projectId: req.params.projectId },
      include: [{ model: Media, as: "media" }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ status: "success", data: galleries });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/gallery - Create a gallery entry with phase info
const createGallery = async (req, res) => {
  try {
    const { projectId, milestoneId, phase, caption } = req.body;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ status: "error", message: "Project not found." });
    }

    const gallery = await Gallery.create({ projectId, milestoneId, phase, caption });
    res.status(201).json({ status: "success", data: gallery });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/gallery/:galleryId/photos - Add photos to a gallery
const addPhotos = async (req, res) => {
  try {
    const gallery = await Gallery.findByPk(req.params.galleryId);
    if (!gallery) {
      return res.status(404).json({ status: "error", message: "Gallery not found." });
    }

    const { urls } = req.body; // array of image URLs
    if (!urls || !urls.length) {
      return res.status(400).json({ status: "error", message: "No URLs provided." });
    }

    const media = await Media.bulkCreate(
      urls.map((url) => ({ galleryId: gallery.id, url, type: "image" }))
    );

    res.status(201).json({ status: "success", data: media });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// POST /admin/gallery/:galleryId/upload - Upload photos from PC
const uploadPhotos = async (req, res) => {
  try {
    const gallery = await Gallery.findByPk(req.params.galleryId);
    if (!gallery) {
      return res.status(404).json({ status: "error", message: "Gallery not found." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: "error", message: "No files uploaded." });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const media = await Media.bulkCreate(
      req.files.map((file) => ({
        galleryId: gallery.id,
        url: `${baseUrl}/uploads/${file.filename}`,
        type: "image",
      }))
    );

    res.status(201).json({ status: "success", data: media });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /admin/gallery/photo/:mediaId - Delete a photo
const deletePhoto = async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.mediaId);
    if (!media) {
      return res.status(404).json({ status: "error", message: "Photo not found." });
    }
    await media.destroy();
    res.json({ status: "success", message: "Photo deleted." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

// DELETE /admin/gallery/:galleryId - Delete entire gallery
const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findByPk(req.params.galleryId);
    if (!gallery) {
      return res.status(404).json({ status: "error", message: "Gallery not found." });
    }
    await Media.destroy({ where: { galleryId: gallery.id } });
    await gallery.destroy();
    res.json({ status: "success", message: "Gallery deleted." });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

module.exports = { getProjectGallery, createGallery, addPhotos, uploadPhotos, deletePhoto, deleteGallery };
