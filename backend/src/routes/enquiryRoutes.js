const express = require("express");

const {
    protect,
    requireAdmin,
} = require("../middleware/authMiddleware");

const {
    createEnquiry,
    getEnquiries,
    getEnquiryById,
    updateEnquiry,
    deleteEnquiry,
} = require("../controllers/enquiryController");

const router = express.Router();

// Public endpoint: customers can submit enquiries.
router.post("/", createEnquiry);

// Every endpoint below this line requires administrator access.
router.use(protect, requireAdmin);

router.get("/", getEnquiries);
router.get("/:id", getEnquiryById);
router.patch("/:id", updateEnquiry);
router.delete("/:id", deleteEnquiry);

module.exports = router;
