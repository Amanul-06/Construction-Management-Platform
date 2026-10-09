const mongoose = require("mongoose");

const progressUpdateSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true,
            index: true,
        },

        date: {
            type: Date,
            required: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000,
        },

        workCompleted: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: "",
        },

        progressPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        images: [
            {
                fileId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                },

                filename: {
                    type: String,
                    required: true,
                },

                contentType: {
                    type: String,
                    required: true,
                },
            },
        ],

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

progressUpdateSchema.index({
    project: 1,
    date: -1,
});

module.exports =
    mongoose.models.ProgressUpdate ||
    mongoose.model("ProgressUpdate", progressUpdateSchema);