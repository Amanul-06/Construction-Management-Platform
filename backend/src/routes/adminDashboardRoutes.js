const express = require("express");

const {
    protect,
    requireAdmin,
} = require("../middleware/authMiddleware");

const {
    getDashboardStats,
    getRecentProjects,
    getRecentEnquiries,
} = require("../controllers/adminDashboardController");

const router = express.Router();

// All dashboard endpoints require an authenticated admin.
router.use(protect, requireAdmin);

router.get("/stats", getDashboardStats);
router.get("/recent-projects", getRecentProjects);
router.get("/recent-enquiries", getRecentEnquiries);

module.exports = router;