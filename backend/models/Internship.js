import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true
        },

        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        intern: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        startDate: {
            type: Date,
            required: true
        },

        endDate: {
            type: Date,
            default: null
        },

        status: {
            type: String,
            enum: ["UPCOMING", "ACTIVE", "COMPLETED"],
            default: "UPCOMING"
        }
    },
    {
        timestamps: true
    }
);

const Internship = mongoose.model("Internship", internshipSchema);

export default Internship;