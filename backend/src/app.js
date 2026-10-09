const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const progressRoutes = require("./routes/progressRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");

const app = express();

// Allowed frontend origins.
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL,
].filter(Boolean);

// CORS configuration.
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error("Origin not allowed by CORS"));
        },
        credentials: true,
    })
);

// Parse JSON request bodies.
app.use(express.json({ limit: "10kb" }));

// API health check.
app.get("/api/health", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Builder360 API is running.",
    });
});

// Authentication routes.
app.use("/api/auth", authRoutes);

// Projects management routes.
app.use("/api/projects", projectRoutes);

// Admin dashboard routes.
app.use("/api/admin/dashboard", adminDashboardRoutes);

// Progress updates routes.
app.use("/api/progress", progressRoutes);

// Unknown endpoint handler.
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: "API endpoint not found.",
    });
});

// Centralized error handler.
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err.message === "Origin not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "Origin not allowed.",
        });
    }

    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({
            success: false,
            message: "Invalid JSON request body.",
        });
    }

    console.error("Unhandled server error:", err.message);

    return res.status(500).json({
        success: false,
        message: "Internal server error.",
    });
});

module.exports = app;