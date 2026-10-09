const multer = require("multer");

const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

const uploadImages = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 10,
    },

    fileFilter: (req, file, callback) => {
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(
                new Error("Only JPEG, PNG, and WebP images are allowed.")
            );
        }

        callback(null, true);
    },
}).array("images", 10);

module.exports = uploadImages;