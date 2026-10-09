const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate the input.
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required.",
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not configured.");

            return res.status(500).json({
                success: false,
                message: "Authentication service is not configured.",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Find an administrator and explicitly retrieve the password hash.
        const user = await User.findOne({
            email: normalizedEmail,
            role: "admin",
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "This administrator account is disabled.",
            });
        }

        // Verify the submitted password.
        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Generate a signed JWT.
        const token = jwt.sign(
            {
                sub: user._id.toString(),
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1h",
                issuer: "builder360-api",
                audience: "builder360-admin",
            }
        );

        return res.status(200).json({
            success: true,
            message: "Admin login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Admin login error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to log in right now. Please try again.",
        });
    }
};

module.exports = {
    adminLogin,
};