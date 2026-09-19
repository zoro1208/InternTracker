import mongoose from "mongoose";

const dailyBreakdownSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: true
        },

        day: {
            type: String,
            required: true
        },

        dayType: {
            type: String,
            enum: ["WEEKDAY", "WEEKEND"],
            required: true
        },

        updateSubmitted: {
            type: Boolean,
            default: false
        },

        hoursWorked: {
            type: Number,
            default: 0
        },

        overtimeHours: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: [
                "SUBMITTED",
                "MISSING",
                "WEEKEND_WORK",
                "NO_WORK"
            ],
            required: true
        }
    },
    {
        _id: false
    }
);

const reportSchema = new mongoose.Schema(
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

        generatedBy: {
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

        totalWorkingDays: {
            type: Number,
            default: 0
        },

        submittedUpdateDays: {
            type: Number,
            default: 0
        },

        missingUpdateDays: {
            type: Number,
            default: 0
        },

        totalExpectedHours: {
            type: Number,
            default: 0
        },

        totalActualHours: {
            type: Number,
            default: 0
        },

        overtimeHours: {
            type: Number,
            default: 0
        },

        weekendHours: {
            type: Number,
            default: 0
        },

        totalTasks: {
            type: Number,
            default: 0
        },

        completedTasks: {
            type: Number,
            default: 0
        },

        pendingTasks: {
            type: Number,
            default: 0
        },

        inProgressTasks: {
            type: Number,
            default: 0
        },

        delayedTasks: {
            type: Number,
            default: 0
        },

        averageTaskProgress: {
            type: Number,
            default: 0
        },

        evaluationScore: {
            type: Number,
            default: null
        },

        communication: {
            type: Number,
            default: null
        },

        technicalSkill: {
            type: Number,
            default: null
        },

        punctuality: {
            type: Number,
            default: null
        },

        taskCompletion: {
            type: Number,
            default: null
        },

        teamwork: {
            type: Number,
            default: null
        },

        // Day-by-day report details
        dailyBreakdown: {
            type: [dailyBreakdownSchema],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Report = mongoose.model("Report", reportSchema);

export default Report;