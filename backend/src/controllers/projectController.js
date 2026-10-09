const mongoose = require("mongoose");

const Project = require("../models/Project");

const allowedStatuses = [
    "planning",
    "ongoing",
    "on-hold",
    "completed",
    "cancelled",
];

const allowedFields = [
    "name",
    "description",
    "projectCode",
    "location",
    "status",
    "startDate",
    "expectedEndDate",
    "budget",
    "progress",
    "client",
];

function validateProjectInput(body, isUpdate = false) {
    const errors = [];

    const has = (field) =>
        Object.prototype.hasOwnProperty.call(body, field);

    if (!isUpdate && (!has("name") || !String(body.name || "").trim())) {
        errors.push("Project name is required.");
    }

    if (has("name")) {
        if (typeof body.name !== "string" || !body.name.trim()) {
            errors.push("Project name must be a non-empty string.");
        } else if (body.name.trim().length > 150) {
            errors.push("Project name cannot exceed 150 characters.");
        }
    }

    if (has("description")) {
        if (typeof body.description !== "string") {
            errors.push("Description must be a string.");
        } else if (body.description.length > 3000) {
            errors.push("Description cannot exceed 3000 characters.");
        }
    }

    if (has("location")) {
        if (typeof body.location !== "string") {
            errors.push("Location must be a string.");
        } else if (body.location.length > 250) {
            errors.push("Location cannot exceed 250 characters.");
        }
    }

    if (has("projectCode") && typeof body.projectCode !== "string") {
        errors.push("Project code must be a string.");
    }

    if (
        has("status") &&
        !allowedStatuses.includes(body.status)
    ) {
        errors.push(
            `Status must be one of: ${allowedStatuses.join(", ")}.`
        );
    }

    for (const field of ["budget", "progress"]) {
        if (has(field)) {
            const value = body[field];

            if (
                value === "" ||
                value === null ||
                value === undefined ||
                !Number.isFinite(Number(value))
            ) {
                errors.push(`${field} must be a valid number.`);
                continue;
            }

            const number = Number(value);

            if (field === "budget" && number < 0) {
                errors.push("Budget cannot be negative.");
            }

            if (field === "progress" && (number < 0 || number > 100)) {
                errors.push("Progress must be between 0 and 100.");
            }
        }
    }

    for (const field of ["startDate", "expectedEndDate"]) {
        if (has(field) && body[field] !== "" && body[field] !== null) {
            const value = body[field];

            if (
                typeof value !== "string" ||
                !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value) ||
                Number.isNaN(Date.parse(value))
            ) {
                errors.push(`${field} must be a valid date.`);
            }
        }
    }

    if (
        has("client") &&
        body.client !== "" &&
        body.client !== null &&
        !mongoose.isValidObjectId(body.client)
    ) {
        errors.push("Client must be a valid user ID.");
    }

    return errors;
}

function pickProjectFields(body) {
    const data = {};

    for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            data[field] = body[field];
        }
    }

    // Normalize empty optional values.
    if (data.projectCode !== undefined) {
        data.projectCode = data.projectCode.trim() || undefined;
    }

    if (data.client === "") {
        data.client = null;
    }

    for (const field of ["startDate", "expectedEndDate"]) {
        if (data[field] === "") {
            data[field] = null;
        }
    }

    return data;
}

// GET /api/projects
async function getProjects(req, res) {
    try {
        const projects = await Project.find()
            .populate("client", "name email")
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: projects.length,
            data: projects,
        });
    } catch (error) {
        console.error("Get projects error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch projects.",
        });
    }
}

// GET /api/projects/:id
async function getProjectById(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID.",
            });
        }

        const project = await Project.findById(req.params.id)
            .populate("client", "name email")
            .populate("createdBy", "name email");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: project,
        });
    } catch (error) {
        console.error("Get project error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch project.",
        });
    }
}

// POST /api/projects
async function createProject(req, res) {
    try {
        const errors = validateProjectInput(req.body);

        if (errors.length) {
            return res.status(400).json({
                success: false,
                message: errors.join(" "),
            });
        }

        const data = pickProjectFields(req.body);

        // Never accept createdBy from the client.
        data.createdBy = req.user.id;

        const project = await Project.create(data);

        return res.status(201).json({
            success: true,
            message: "Project created successfully.",
            data: project,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "That project code is already in use.",
            });
        }

        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        console.error("Create project error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to create project.",
        });
    }
}

// PUT /api/projects/:id
async function updateProject(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID.",
            });
        }

        const errors = validateProjectInput(req.body, true);

        if (errors.length) {
            return res.status(400).json({
                success: false,
                message: errors.join(" "),
            });
        }

        const data = pickProjectFields(req.body);

        if (Object.keys(data).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Provide at least one field to update.",
            });
        }

        const project = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: data },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project updated successfully.",
            data: project,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "That project code is already in use.",
            });
        }

        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }

        console.error("Update project error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update project.",
        });
    }
}

// DELETE /api/projects/:id
async function deleteProject(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID.",
            });
        }

        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully.",
        });
    } catch (error) {
        console.error("Delete project error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to delete project.",
        });
    }
}

module.exports = {
    getProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
};
