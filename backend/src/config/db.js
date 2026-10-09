const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from .env");
        }

        const connection = await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log("MongoDB connected successfully!");
        console.log(`Host: ${connection.connection.host}`);
        console.log(`Database: ${connection.connection.name}`);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

module.exports = connectDB;