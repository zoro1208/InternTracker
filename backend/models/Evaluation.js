import mongoose from "mongoose";

const evaluationSchema = new mongoose.Schema(
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

        mentor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        periodType: {
            type: String,
            enum: ["WEEKLY", "MONTHLY"],
            required: true
        },

        periodStart: {
            type: Date,
            required: true
        },

        periodEnd: {
            type: Date,
            required: true
        },

        communication: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },

        technicalSkill: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },

        punctuality: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },

        taskCompletion: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },

        teamwork: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },

        finalScore: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },

        comments: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Evaluation = mongoose.model("Evaluation", evaluationSchema);

export default Evaluation;