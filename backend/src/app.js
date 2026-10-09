const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    "https://construction-management-platform-five.vercel.app",
];

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

app.use(express.json({ limit: "10kb" }));

// API homepage
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Construction Management Platform API is running",
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found",
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error("API error:", err.message);

    if (err.message === "Origin not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "Cross-origin request not allowed",
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal server error",
    });
});

module.exports = app;