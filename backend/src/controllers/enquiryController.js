const mongoose = require("mongoose");
const Enquiry = require("../models/Enquiry");

// Submit a new enquiry from the public website.
const createEnquiry = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            company,
            subject,
            message,
        } = req.body || {};

        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof email !== "string" ||
            !email.trim() ||
            typeof subject !== "string" ||
            !subject.trim() ||
            typeof message !== "string" ||
            !message.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name, email, enquiry type, and message are required.",
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanSubject = subject.trim();
        const cleanMessage = message.trim();

        if (cleanName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name cannot exceed 100 characters.",
            });
        }

        if (
            cleanEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address.",
            });
        }

        if (cleanSubject.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Enquiry type cannot exceed 200 characters.",
            });
        }

        if (cleanMessage.length < 10 || cleanMessage.length > 3000) {
            return res.status(400).json({
                success: false,
                message: "Message must contain between 10 and 3000 characters.",
            });
        }

        const cleanPhone =
            typeof phone === "string" ? phone.trim() : "";

        const cleanCompany =
            typeof company === "string" ? company.trim() : "";

        if (cleanPhone.length > 25 || cleanCompany.length > 150) {
            return res.status(400).json({
                success: false,
                message: "Phone or company information exceeds the allowed length.",
            });
        }

        const enquiry = await Enquiry.create({
            name: cleanName,
            email: cleanEmail,
            phone: cleanPhone,
            company: cleanCompany,
            subject: cleanSubject,
            message: cleanMessage,
            status: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Your enquiry has been submitted successfully.",
            data: {
                id: enquiry._id,
                status: enquiry.status,
                createdAt: enquiry.createdAt,
            },
        });
    } catch (error) {
        console.error("Create enquiry error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to submit your enquiry. Please try again later.",
        });
    }
};

// List enquiries for administrators.
const getEnquiries = async (req, res) => {
    try {
        const {
            status = "all",
            search = "",
            page = "1",
            limit = "20",
        } = req.query;

        const allowedStatuses = [
            "pending",
            "in-progress",
            "resolved",
            "closed",
        ];

        if (status !== "all" && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enquiry status.",
            });
        }

        const currentPage = Math.max(1, parseInt(page, 10) || 1);
        const pageSize = Math.min(
            100,
            Math.max(1, parseInt(limit, 10) || 20)
        );

        const filter = {};

        if (status !== "all") {
            filter.status = status;
        }

        const query = String(search).trim().slice(0, 100);

        if (query) {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

            filter.$or = [
                { name: { $regex: escapedQuery, $options: "i" } },
                { email: { $regex: escapedQuery, $options: "i" } },
                { phone: { $regex: escapedQuery, $options: "i" } },
                { company: { $regex: escapedQuery, $options: "i" } },
                { subject: { $regex: escapedQuery, $options: "i" } },
            ];
        }

        const [enquiries, total] = await Promise.all([
            Enquiry.find(filter)
                .sort({ createdAt: -1 })
                .skip((currentPage - 1) * pageSize)
                .limit(pageSize)
                .populate("assignedTo", "name email")
                .lean(),
            Enquiry.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            data: enquiries,
            pagination: {
                page: currentPage,
                limit: pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        console.error("Get enquiries error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve enquiries.",
        });
    }
};

// Retrieve one enquiry.
const getEnquiryById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enquiry ID.",
            });
        }

        const enquiry = await Enquiry.findById(req.params.id)
            .populate("assignedTo", "name email")
            .lean();

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found.",
            });
        }

        return res.status(200).json({
            success: true,
            data: enquiry,
        });
    } catch (error) {
        console.error("Get enquiry error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve the enquiry.",
        });
    }
};

// Update an enquiry's status or internal notes.
const updateEnquiry = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enquiry ID.",
            });
        }

        const allowedFields = ["status", "notes"];
        const suppliedFields = Object.keys(req.body || {});

        if (
            suppliedFields.length === 0 ||
            suppliedFields.some((field) => !allowedFields.includes(field))
        ) {
            return res.status(400).json({
                success: false,
                message: "Only status and notes can be updated.",
            });
        }

        const updates = {};

        if (Object.prototype.hasOwnProperty.call(req.body, "status")) {
            const allowedStatuses = [
                "pending",
                "in-progress",
                "resolved",
                "closed",
            ];

            if (!allowedStatuses.includes(req.body.status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid enquiry status.",
                });
            }

            updates.status = req.body.status;
        }

        if (Object.prototype.hasOwnProperty.call(req.body, "notes")) {
            if (
                typeof req.body.notes !== "string" ||
                req.body.notes.length > 3000
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Notes must be text and cannot exceed 3000 characters.",
                });
            }

            updates.notes = req.body.notes.trim();
        }

        const enquiry = await Enquiry.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        ).populate("assignedTo", "name email");

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Enquiry updated successfully.",
            data: enquiry,
        });
    } catch (error) {
        console.error("Update enquiry error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to update the enquiry.",
        });
    }
};

// Delete an enquiry.
const deleteEnquiry = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid enquiry ID.",
            });
        }

        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: "Enquiry not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Enquiry deleted successfully.",
        });
    } catch (error) {
        console.error("Delete enquiry error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Unable to delete the enquiry.",
        });
    }
};

module.exports = {
    createEnquiry,
    getEnquiries,
    getEnquiryById,
    updateEnquiry,
    deleteEnquiry,
};
