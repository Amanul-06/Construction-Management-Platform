require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");

const createAdmin = async () => {
    try {
        const {
            ADMIN_NAME,
            ADMIN_EMAIL,
            ADMIN_PASSWORD,
        } = process.env;

        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
            throw new Error(
                "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in backend/.env."
            );
        }

        if (ADMIN_PASSWORD.length < 12) {
            throw new Error(
                "ADMIN_PASSWORD must be at least 12 characters long."
            );
        }

        await connectDB();

        const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            throw new Error(
                "An account with this email already exists. No account was created."
            );
        }

        const hashedPassword = await bcrypt.hash(
            ADMIN_PASSWORD,
            12
        );

        const admin = await User.create({
            name: ADMIN_NAME.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "admin",
            isActive: true,
        });

        console.log("Administrator created successfully.");
        console.log(`Administrator ID: ${admin._id}`);
        console.log(`Administrator email: ${admin.email}`);
    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => { });
    }
};

createAdmin();