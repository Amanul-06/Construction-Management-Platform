const mongoose = require("mongoose");
const { Readable } = require("stream");

const Project = require("../models/Project");
const ProgressUpdate = require("../models/ProgressUpdate");
const { getGridFSBucket } = require("../config/gridfs");

const MAX_IMAGES = 10;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
];

function isValidDate(value) {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
}

function validateFields(body) {
    const { date, description, workCompleted, progressPercentage } = body;

    if (!isValidDate(date)) {
        return "Provide a valid date in YYYY-MM-DD format.";
    }

    if (
        typeof description !== "string" ||
        !description.trim() ||
        description.trim().length > 3000
    ) {
        return "Description is required and must not exceed 3000 characters.";
    }

    if (
        workCompleted !== undefined &&
        (
            typeof workCompleted !== "string" ||
            workCompleted.length > 2000
        )
    ) {
        return "Work completed must not exceed 2000 characters.";
    }

    const progress = Number(progressPercentage);

    if (
        progressPercentage === undefined ||
        progressPercentage === "" ||
        !Number.isFinite(progress) ||
        progress < 0 ||
        progress > 100
    ) {
        return "Progress percentage must be between 0 and 100.";
    }

    return null;
}

function uploadImage(file, bucket) {
    return new Promise((resolve, reject) => {
        const filename = `${Date.now()}-${file.originalname.replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        )}`;

        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                originalName: file.originalname,
                contentType: file.mimetype,
            },
        });

        uploadStream.on("error", reject);

        uploadStream.on("finish", () => {
            resolve({
                fileId: uploadStream.id,
                filename,
                contentType: file.mimetype,
            });
        });

        Readable.from(file.buffer).pipe(uploadStream);
    });
}

async function deleteStoredImages(images) {
    if (!images?.length) return;

    const bucket = getGridFSBucket();

    await Promise.allSettled(
        images.map(async (image) => {
            if (image.fileId) {
                await bucket.delete(
                    new mongoose.Types.ObjectId(image.fileId)
                );
            }
        })
    );
}

function validateFiles(files) {
    if (files.length > MAX_IMAGES) {
        return "You can upload a maximum of 10 images per report.";
    }

    for (const file of files) {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return "Only JPEG, PNG, and WebP images are allowed.";
        }

        if (file.size > MAX_FILE_SIZE) {
            return `${file.originalname} exceeds the 5 MB file-size limit.`;
        }
    }

    return null;
}

async function synchronizeProjectProgress(projectId) {
    const latestUpdate = await ProgressUpdate.findOne({
        project: projectId,
    })
        .sort({ date: -1, createdAt: -1 })
        .select("progressPercentage")
        .lean();

    await Project.findByIdAndUpdate(projectId, {
        progress: latestUpdate
            ? latestUpdate.progressPercentage
            : 0,
    });
}

// POST /api/progress/:projectId
async function createProgressUpdate(req, res) {
    let uploadedImages = [];

    try {
        const { projectId } = req.params;

        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID.",
            });
        }

        const validationError = validateFields(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found.",
            });
        }

        const files = req.files || [];
        const fileError = validateFiles(files);

        if (fileError) {
            return res.status(400).json({
                success: false,
                message: fileError,
            });
        }

        const bucket = getGridFSBucket();

        for (const file of files) {
            uploadedImages.push(await uploadImage(file, bucket));
        }

        const update = await ProgressUpdate.create({
            project: project._id,
            date: new Date(`${req.body.date}T00:00:00.000Z`),
            description: req.body.description.trim(),
            workCompleted: (req.body.workCompleted || "").trim(),
            progressPercentage: Number(req.body.progressPercentage),
            images: uploadedImages,
            createdBy: req.user.id,
        });

        await synchronizeProjectProgress(project._id);

        return res.status(201).json({
            success: true,
            message: "Daily progress update created successfully.",
            data: update,
        });
    } catch (error) {
        await deleteStoredImages(uploadedImages);

        console.error("Create progress update error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create the progress update.",
        });
    }
}

// GET /api/progress/:projectId
async function getProjectProgress(req, res) {
    try {
        const { projectId } = req.params;

        if (!mongoose.isValidObjectId(projectId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID.",
            });
        }

        const project = await Project.findById(projectId).select("_id name");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found.",
            });
        }

        const updates = await ProgressUpdate.find({
            project: projectId,
        })
            .populate("createdBy", "name")
            .sort({ date: -1, createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            count: updates.length,
            data: updates,
        });
    } catch (error) {
        console.error("Get progress updates error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch progress updates.",
        });
    }
}

// PUT /api/progress/:projectId/:updateId
async function updateProgressUpdate(req, res) {
    let newlyUploadedImages = [];

    try {
        const { projectId, updateId } = req.params;

        if (
            !mongoose.isValidObjectId(projectId) ||
            !mongoose.isValidObjectId(updateId)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid project or report ID.",
            });
        }

        const validationError = validateFields(req.body);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        const update = await ProgressUpdate.findOne({
            _id: updateId,
            project: projectId,
        });

        if (!update) {
            return res.status(404).json({
                success: false,
                message: "Progress report not found for this project.",
            });
        }

        const files = req.files || [];
        const fileError = validateFiles(files);

        if (fileError) {
            return res.status(400).json({
                success: false,
                message: fileError,
            });
        }

        let keepImageIds = [];

        if (req.body.keepImageIds !== undefined) {
            try {
                keepImageIds = JSON.parse(req.body.keepImageIds);

                if (!Array.isArray(keepImageIds)) {
                    throw new Error("Expected an array.");
                }
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Invalid retained-image list.",
                });
            }
        } else {
            // Preserve current images if the client does not send a list.
            keepImageIds = update.images.map((image) =>
                String(image.fileId)
            );
        }

        if (keepImageIds.some((id) => !mongoose.isValidObjectId(id))) {
            return res.status(400).json({
                success: false,
                message: "Invalid image ID in retained-image list.",
            });
        }

        const currentImages = update.images || [];

        const retainedImages = currentImages.filter((image) =>
            keepImageIds.includes(String(image.fileId))
        );

        if (retainedImages.length !== new Set(keepImageIds).size) {
            return res.status(400).json({
                success: false,
                message: "One or more images do not belong to this report.",
            });
        }

        if (retainedImages.length + files.length > MAX_IMAGES) {
            return res.status(400).json({
                success: false,
                message: "A report can contain a maximum of 10 images.",
            });
        }

        const bucket = getGridFSBucket();

        for (const file of files) {
            newlyUploadedImages.push(await uploadImage(file, bucket));
        }

        const removedImages = currentImages.filter(
            (image) =>
                !retainedImages.some(
                    (retained) =>
                        String(retained.fileId) === String(image.fileId)
                )
        );

        update.date = new Date(`${req.body.date}T00:00:00.000Z`);
        update.description = req.body.description.trim();
        update.workCompleted = (req.body.workCompleted || "").trim();
        update.progressPercentage = Number(req.body.progressPercentage);
        update.images = [...retainedImages, ...newlyUploadedImages];

        await update.save();

        await synchronizeProjectProgress(projectId);

        // Delete removed files only after the report has been saved.
        await deleteStoredImages(removedImages);

        const savedUpdate = await ProgressUpdate.findById(update._id)
            .populate("createdBy", "name")
            .lean();

        return res.status(200).json({
            success: true,
            message: "Progress report updated successfully.",
            data: savedUpdate,
        });
    } catch (error) {
        await deleteStoredImages(newlyUploadedImages);

        console.error("Update progress report error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update the progress report.",
        });
    }
}

// GET /api/progress/images/:fileId
async function getProgressImage(req, res) {
    try {
        const { fileId } = req.params;

        if (!mongoose.isValidObjectId(fileId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid image ID.",
            });
        }

        const bucket = getGridFSBucket();
        const objectId = new mongoose.Types.ObjectId(fileId);

        const files = await bucket
            .find({ _id: objectId })
            .limit(1)
            .toArray();

        if (!files.length) {
            return res.status(404).json({
                success: false,
                message: "Image not found.",
            });
        }

        const file = files[0];

        // The MIME type is saved in metadata by the updated uploader.
        // Look up the report as a fallback for images uploaded previously.
        let contentType =
            file.metadata?.contentType ||
            file.contentType ||
            null;

        if (!contentType) {
            const report = await ProgressUpdate.findOne({
                "images.fileId": objectId,
            })
                .select("images")
                .lean();

            const imageRecord = report?.images?.find(
                (image) => String(image.fileId) === String(objectId)
            );

            contentType = imageRecord?.contentType || null;
        }

        if (!ALLOWED_MIME_TYPES.includes(contentType)) {
            return res.status(415).json({
                success: false,
                message: "Unsupported or missing image type.",
            });
        }

        res.set({
            "Content-Type": contentType,
            "Content-Length": file.length,
            "Cache-Control": "private, max-age=3600",
            "X-Content-Type-Options": "nosniff",
            "Content-Disposition": "inline",
        });

        const downloadStream = bucket.openDownloadStream(objectId);

        downloadStream.on("error", (error) => {
            console.error("GridFS image stream error:", error.message);

            if (!res.headersSent) {
                res.status(500).end();
            } else {
                res.end();
            }
        });

        return downloadStream.pipe(res);
    } catch (error) {
        console.error("Get progress image error:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: "Unable to retrieve the image.",
            });
        }
    }
}

module.exports = {
    createProgressUpdate,
    getProjectProgress,
    updateProgressUpdate,
    getProgressImage,
};
