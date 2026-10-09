const express = require("express");

const {
    protect,
    requireAdmin,
} = require("../middleware/authMiddleware");

const {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
} = require("../controllers/projectController");

const router = express.Router();

// Every Projects endpoint requires administrator authentication.
router.use(protect, requireAdmin);

router.get("/", getProjects);
router.get("/:id", getProjectById);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;
