import mongoose from "mongoose";

const dailyUpdateSchema = new mongoose.Schema(
    {
        internship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            required: true
        },

        intern: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        date: {
            type: Date,
            required: true,
            default: Date.now
        },

        workDescription: {
            type: String,
            required: true,
            trim: true
        },

        hoursWorked: {
            type: Number,
            required: true,
            min: 0
        },

        challenges: {
            type: String,
            trim: true,
            default: ""
        },

        learnings: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const DailyUpdate = mongoose.model(
    "DailyUpdate",
    dailyUpdateSchema
);

export default DailyUpdate;