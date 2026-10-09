const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Project name is required"],
            trim: true,
            maxlength: 150,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 3000,
            default: "",
        },

        projectCode: {
            type: String,
            trim: true,
            uppercase: true,
            unique: true,
            sparse: true,
        },

        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        location: {
            type: String,
            trim: true,
            maxlength: 250,
            default: "",
        },

        status: {
            type: String,
            enum: [
                "planning",
                "ongoing",
                "on-hold",
                "completed",
                "cancelled",
            ],
            default: "planning",
            required: true,
        },

        startDate: {
            type: Date,
            default: null,
        },

        expectedEndDate: {
            type: Date,
            default: null,
        },

        budget: {
            type: Number,
            min: 0,
            default: 0,
        },

        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

projectSchema.index({ status: 1, createdAt: -1 });

module.exports =
    mongoose.models.Project ||
    mongoose.model("Project", projectSchema);