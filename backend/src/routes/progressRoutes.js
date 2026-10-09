const express = require("express");

const {
    protect,
    requireAdmin,
} = require("../middleware/authMiddleware");

const uploadImages = require("../middleware/uploadImages");

const {
    createProgressUpdate,
    getProjectProgress,
    updateProgressUpdate,
    getProgressImage,
} = require("../controllers/progressController");

const router = express.Router();

// All progress endpoints require administrator authentication.
router.use(protect, requireAdmin);

// Retrieve a stored image.
// The frontend must send the admin token when fetching this URL.
router.get("/images/:fileId", getProgressImage);

// Retrieve all progress reports for a project.
router.get("/:projectId", getProjectProgress);

// Create a daily report with multiple photographs.
router.post(
    "/:projectId",
    uploadImages,
    createProgressUpdate
);

// Edit an existing report and manage its photographs.
router.put(
    "/:projectId/:updateId",
    uploadImages,
    updateProgressUpdate
);

module.exports = router;
