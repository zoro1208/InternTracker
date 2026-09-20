import Evaluation from "../models/Evaluation.js";
import Internship from "../models/Internship.js";
import User from "../models/User.js";


// ======================================================
// Get today's date in India
// ======================================================

const getToday = () => {
    return new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata"
    });
};


// ======================================================
// Get current week's Monday
// ======================================================

const getWeekStart = () => {
    const today = new Date(
        `${getToday()}T00:00:00+05:30`
    );

    const day = today.getDay();

    // Monday = 1, Sunday = 0
    const difference = day === 0 ? -6 : 1 - day;

    today.setDate(
        today.getDate() + difference
    );

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const date = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${date}`;
};


// ======================================================
// Get current month's first day
// ======================================================

const getMonthStart = () => {
    const today = getToday();

    return `${today.substring(0, 7)}-01`;
};


// ======================================================
// Create Evaluation
// ======================================================

export const createEvaluation = async (req, res) => {
    try {
        const {
            internship,
            periodType = "WEEKLY",
            communication,
            technicalSkill,
            punctuality,
            taskCompletion,
            teamwork,
            comments
        } = req.body;

        // --------------------------------------------------
        // Validate required fields
        // --------------------------------------------------

        if (
            !internship ||
            communication === undefined ||
            technicalSkill === undefined ||
            punctuality === undefined ||
            taskCompletion === undefined ||
            teamwork === undefined
        ) {
            return res.status(400).json({
                message:
                    "Internship and all evaluation scores are required"
            });
        }

        // --------------------------------------------------
        // Validate period type
        // --------------------------------------------------

        if (
            !["WEEKLY", "MONTHLY"].includes(
                periodType
            )
        ) {
            return res.status(400).json({
                message:
                    "periodType must be WEEKLY or MONTHLY"
            });
        }

        // --------------------------------------------------
        // Validate scores
        // --------------------------------------------------

        const scores = {
            communication,
            technicalSkill,
            punctuality,
            taskCompletion,
            teamwork
        };

        for (const [field, score] of Object.entries(scores)) {
            if (
                typeof score !== "number" ||
                score < 0 ||
                score > 100
            ) {
                return res.status(400).json({
                    message:
                        `${field} must be between 0 and 100`
                });
            }
        }

        // --------------------------------------------------
        // Find internship
        // --------------------------------------------------

        const internshipExists =
            await Internship.findById(internship);

        if (!internshipExists) {
            return res.status(404).json({
                message: "Internship not found"
            });
        }

        // --------------------------------------------------
        // Ensure logged-in mentor owns internship
        // --------------------------------------------------

        if (
            internshipExists.mentor.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You are not the mentor of this internship"
            });
        }

        // --------------------------------------------------
        // Get intern automatically from internship
        // --------------------------------------------------

        const intern = internshipExists.intern;

        if (!intern) {
            return res.status(400).json({
                message:
                    "No intern is assigned to this internship"
            });
        }

        const internExists =
            await User.findById(intern);

        if (
            !internExists ||
            internExists.role !== "INTERN"
        ) {
            return res.status(404).json({
                message: "Assigned intern not found"
            });
        }

        // --------------------------------------------------
        // Automatically calculate evaluation period
        // --------------------------------------------------

        const periodStartString =
            periodType === "MONTHLY"
                ? getMonthStart()
                : getWeekStart();

        const periodEndString = getToday();

        const periodStart = new Date(
            `${periodStartString}T00:00:00+05:30`
        );

        const periodEnd = new Date(
            `${periodEndString}T00:00:00+05:30`
        );

        // --------------------------------------------------
        // Prevent duplicate evaluation
        // --------------------------------------------------

        const existingEvaluation =
            await Evaluation.findOne({
                internship,
                intern,
                periodType,
                periodStart,
                periodEnd
            });

        if (existingEvaluation) {
            return res.status(400).json({
                message:
                    `Evaluation already exists for this ${periodType.toLowerCase()} period`
            });
        }

        // --------------------------------------------------
        // Calculate weighted final score
        // --------------------------------------------------

        const finalScore = Number(
            (
                communication * 0.20 +
                technicalSkill * 0.25 +
                punctuality * 0.15 +
                taskCompletion * 0.25 +
                teamwork * 0.15
            ).toFixed(2)
        );

        // --------------------------------------------------
        // Create evaluation
        // --------------------------------------------------

        const evaluation =
            await Evaluation.create({
                internship,
                intern,
                mentor: req.user._id,

                periodType,
                periodStart,
                periodEnd,

                communication,
                technicalSkill,
                punctuality,
                taskCompletion,
                teamwork,

                finalScore,

                comments: comments || ""
            });

        // --------------------------------------------------
        // Populate response
        // --------------------------------------------------

        const populatedEvaluation =
            await Evaluation.findById(
                evaluation._id
            )
                .populate(
                    "internship",
                    "title"
                )
                .populate(
                    "intern",
                    "name email"
                )
                .populate(
                    "mentor",
                    "name email"
                );

        res.status(201).json({
            message:
                "Evaluation created successfully",
            evaluation:
                populatedEvaluation
        });

    } catch (error) {
        console.error(
            "Evaluation creation error:",
            error
        );

        res.status(500).json({
            message:
                "Evaluation creation failed",
            error: error.message
        });
    }
};


// ======================================================
// Get Evaluations
// ======================================================

export const getEvaluations = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === "MENTOR") {
            filter.mentor = req.user._id;
        }

        if (req.user.role === "INTERN") {
            filter.intern = req.user._id;
        }

        const evaluations =
            await Evaluation.find(filter)
                .populate(
                    "internship",
                    "title"
                )
                .populate(
                    "intern",
                    "name email"
                )
                .populate(
                    "mentor",
                    "name email"
                )
                .sort({
                    periodStart: -1
                });

        res.status(200).json({
            count: evaluations.length,
            evaluations
        });

    } catch (error) {
        res.status(500).json({
            message:
                "Failed to fetch evaluations",
            error: error.message
        });
    }
};


// ======================================================
// Get Evaluation by ID
// ======================================================

export const getEvaluationById = async (req, res) => {
    try {
        const evaluation =
            await Evaluation.findById(
                req.params.id
            )
                .populate(
                    "internship",
                    "title"
                )
                .populate(
                    "intern",
                    "name email"
                )
                .populate(
                    "mentor",
                    "name email"
                );

        if (!evaluation) {
            return res.status(404).json({
                message:
                    "Evaluation not found"
            });
        }

        // Intern sees only own evaluation
        if (
            req.user.role === "INTERN" &&
            evaluation.intern._id.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "Access denied"
            });
        }

        // Mentor sees only evaluations they created
        if (
            req.user.role === "MENTOR" &&
            evaluation.mentor._id.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "Access denied"
            });
        }

        res.status(200).json({
            evaluation
        });

    } catch (error) {
        res.status(500).json({
            message:
                "Failed to fetch evaluation",
            error: error.message
        });
    }
};


// ======================================================
// Update Evaluation
// ======================================================

export const updateEvaluation = async (req, res) => {
    try {
        const evaluation =
            await Evaluation.findById(
                req.params.id
            );

        if (!evaluation) {
            return res.status(404).json({
                message:
                    "Evaluation not found"
            });
        }

        // Only the mentor who created it can update
        if (
            evaluation.mentor.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "Only the assigned mentor can update this evaluation"
            });
        }

        const {
            communication,
            technicalSkill,
            punctuality,
            taskCompletion,
            teamwork,
            comments
        } = req.body;

        const updatedScores = {
            communication:
                communication !== undefined
                    ? communication
                    : evaluation.communication,

            technicalSkill:
                technicalSkill !== undefined
                    ? technicalSkill
                    : evaluation.technicalSkill,

            punctuality:
                punctuality !== undefined
                    ? punctuality
                    : evaluation.punctuality,

            taskCompletion:
                taskCompletion !== undefined
                    ? taskCompletion
                    : evaluation.taskCompletion,

            teamwork:
                teamwork !== undefined
                    ? teamwork
                    : evaluation.teamwork
        };

        for (
            const [field, score]
            of Object.entries(updatedScores)
        ) {
            if (
                typeof score !== "number" ||
                score < 0 ||
                score > 100
            ) {
                return res.status(400).json({
                    message:
                        `${field} must be between 0 and 100`
                });
            }
        }

        evaluation.communication =
            updatedScores.communication;

        evaluation.technicalSkill =
            updatedScores.technicalSkill;

        evaluation.punctuality =
            updatedScores.punctuality;

        evaluation.taskCompletion =
            updatedScores.taskCompletion;

        evaluation.teamwork =
            updatedScores.teamwork;

        evaluation.finalScore = Number(
            (
                evaluation.communication * 0.20 +
                evaluation.technicalSkill * 0.25 +
                evaluation.punctuality * 0.15 +
                evaluation.taskCompletion * 0.25 +
                evaluation.teamwork * 0.15
            ).toFixed(2)
        );

        if (comments !== undefined) {
            evaluation.comments = comments;
        }

        await evaluation.save();

        const updatedEvaluation =
            await Evaluation.findById(
                evaluation._id
            )
                .populate(
                    "internship",
                    "title"
                )
                .populate(
                    "intern",
                    "name email"
                )
                .populate(
                    "mentor",
                    "name email"
                );

        res.status(200).json({
            message:
                "Evaluation updated successfully",
            evaluation:
                updatedEvaluation
        });

    } catch (error) {
        res.status(500).json({
            message:
                "Evaluation update failed",
            error: error.message
        });
    }
};


// ======================================================
// Delete Evaluation
// ======================================================

export const deleteEvaluation = async (req, res) => {
    try {
        const evaluation =
            await Evaluation.findById(
                req.params.id
            );

        if (!evaluation) {
            return res.status(404).json({
                message:
                    "Evaluation not found"
            });
        }

        // Only Admin or evaluation's mentor can delete
        if (
            req.user.role !== "ADMIN" &&
            evaluation.mentor.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "Access denied"
            });
        }

        await Evaluation.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            message:
                "Evaluation deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message:
                "Evaluation deletion failed",
            error: error.message
        });
    }
};