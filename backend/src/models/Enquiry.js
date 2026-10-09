const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
            maxlength: 254,
        },

        phone: {
            type: String,
            trim: true,
            maxlength: 25,
            default: "",
        },

        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
            maxlength: 200,
        },

        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
            maxlength: 5000,
        },

        projectType: {
            type: String,
            trim: true,
            maxlength: 100,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "pending",
                "in-progress",
                "resolved",
                "closed",
            ],
            default: "pending",
            required: true,
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 3000,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

enquirySchema.index({ status: 1, createdAt: -1 });

module.exports =
    mongoose.models.Enquiry ||
    mongoose.model("Enquiry", enquirySchema);