import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        // Internship this task belongs to
        internship: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            required: true
        },

        // Task title
        title: {
            type: String,
            required: true,
            trim: true
        },

        // Task description
        description: {
            type: String,
            trim: true,
            default: ""
        },

        // Intern assigned to this individual task
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Date on which the task is assigned/due
        dueDate: {
            type: Date,
            required: true
        },

        // Whether this task was created through mentor broadcast
        isBroadcast: {
            type: Boolean,
            default: false
        },

        // Groups all individual tasks created from one broadcast
        broadcastId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null
        },

        // Task status
        status: {
            type: String,
            enum: [
                "PENDING",
                "IN_PROGRESS",
                "COMPLETED",
                "DELAYED"
            ],
            default: "PENDING"
        },

        // Individual intern progress
        progress: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },

        // Individual intern hours
        hoursSpent: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;