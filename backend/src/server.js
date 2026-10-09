require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5005;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Builder360 API running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start Builder360:", error.message);
        process.exit(1);
    }
};

startServer();