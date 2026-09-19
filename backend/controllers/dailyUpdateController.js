import DailyUpdate from "../models/DailyUpdate.js";
import Internship from "../models/Internship.js";


// ==================================================
// Create Daily Update
// ==================================================

export const createDailyUpdate = async (req, res) => {
    try {
        const {
            internship,
            workDescription,
            hoursWorked,
            challenges,
            learnings
        } = req.body;

        // Required fields
        if (
            !internship ||
            !workDescription ||
            hoursWorked === undefined
        ) {
            return res.status(400).json({
                message:
                    "Internship, workDescription and hoursWorked are required"
            });
        }

        // Validate hours
        if (hoursWorked < 0) {
            return res.status(400).json({
                message: "Hours worked cannot be negative"
            });
        }

        // Check internship
        const internshipExists = await Internship.findById(internship);

        if (!internshipExists) {
            return res.status(404).json({
                message: "Internship not found"
            });
        }

        // Only the intern assigned to this internship can submit
        if (
            internshipExists.intern.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only submit updates for your own internship"
            });
        }

        // Automatically use today's date
        const today = new Date();

        const startOfToday = new Date(today);
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date(startOfToday);
        endOfToday.setDate(endOfToday.getDate() + 1);

        // Prevent duplicate update for today
        const existingUpdate = await DailyUpdate.findOne({
            internship,
            intern: req.user._id,
            date: {
                $gte: startOfToday,
                $lt: endOfToday
            }
        });

        if (existingUpdate) {
            return res.status(400).json({
                message: "Daily update already submitted for today"
            });
        }

        // Create daily update
        const dailyUpdate = await DailyUpdate.create({
            internship,
            intern: req.user._id,
            date: today,
            workDescription,
            hoursWorked,
            challenges,
            learnings
        });

        // Populate response
        const populatedUpdate = await DailyUpdate.findById(
            dailyUpdate._id
        )
            .populate("internship", "title")
            .populate("intern", "name email");

        res.status(201).json({
            message: "Daily update submitted successfully",
            dailyUpdate: populatedUpdate
        });

    } catch (error) {
        res.status(500).json({
            message: "Daily update creation failed",
            error: error.message
        });
    }
};


// ==================================================
// Get Daily Updates
// ==================================================

export const getDailyUpdates = async (req, res) => {
    try {
        let updates;

        if (req.user.role === "INTERN") {

            // Intern sees only their own updates
            updates = await DailyUpdate.find({
                intern: req.user._id
            });

        } else if (req.user.role === "MENTOR") {

            // Find internships handled by this mentor
            const internships = await Internship.find({
                mentor: req.user._id
            }).select("_id");

            const internshipIds = internships.map(
                internship => internship._id
            );

            // Mentor sees updates from assigned internships
            updates = await DailyUpdate.find({
                internship: { $in: internshipIds }
            });

        } else if (req.user.role === "ADMIN") {

            // Admin sees all updates
            updates = await DailyUpdate.find({});

        } else {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // Populate references
        updates = await DailyUpdate.populate(updates, [
            {
                path: "internship",
                select: "title"
            },
            {
                path: "intern",
                select: "name email"
            }
        ]);

        // Sort newest first
        updates.sort(
            (a, b) => new Date(b.date) - new Date(a.date)
        );

        res.status(200).json({
            count: updates.length,
            dailyUpdates: updates
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch daily updates",
            error: error.message
        });
    }
};


// ==================================================
// Get Daily Update by ID
// ==================================================

export const getDailyUpdateById = async (req, res) => {
    try {
        const update = await DailyUpdate.findById(req.params.id)
            .populate("internship", "title mentor intern")
            .populate("intern", "name email");

        if (!update) {
            return res.status(404).json({
                message: "Daily update not found"
            });
        }

        // Intern can view only their own update
        if (
            req.user.role === "INTERN" &&
            update.intern._id.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // Mentor can view updates from their internships
        if (req.user.role === "MENTOR") {

            if (
                update.internship.mentor.toString() !==
                req.user._id.toString()
            ) {
                return res.status(403).json({
                    message: "Access denied"
                });
            }
        }

        // Admin can view everything

        res.status(200).json({
            dailyUpdate: update
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch daily update",
            error: error.message
        });
    }
};


// ==================================================
// Update Daily Update
// ==================================================

export const updateDailyUpdate = async (req, res) => {
    try {
        const update = await DailyUpdate.findById(req.params.id);

        if (!update) {
            return res.status(404).json({
                message: "Daily update not found"
            });
        }

        // Only the intern who created it can edit it
        if (
            update.intern.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "You can only update your own daily update"
            });
        }

        const {
            workDescription,
            hoursWorked,
            challenges,
            learnings
        } = req.body;

        if (workDescription !== undefined) {
            update.workDescription = workDescription;
        }

        if (hoursWorked !== undefined) {

            if (hoursWorked < 0) {
                return res.status(400).json({
                    message: "Hours worked cannot be negative"
                });
            }

            update.hoursWorked = hoursWorked;
        }

        if (challenges !== undefined) {
            update.challenges = challenges;
        }

        if (learnings !== undefined) {
            update.learnings = learnings;
        }

        await update.save();

        // Populate updated document
        const updatedDocument = await DailyUpdate.findById(
            update._id
        )
            .populate("internship", "title")
            .populate("intern", "name email");

        res.status(200).json({
            message: "Daily update updated successfully",
            dailyUpdate: updatedDocument
        });

    } catch (error) {
        res.status(500).json({
            message: "Daily update update failed",
            error: error.message
        });
    }
};


// ==================================================
// Delete Daily Update
// ==================================================

export const deleteDailyUpdate = async (req, res) => {
    try {
        const update = await DailyUpdate.findById(req.params.id);

        if (!update) {
            return res.status(404).json({
                message: "Daily update not found"
            });
        }

        // Intern can delete only their own update
        if (
            req.user.role === "INTERN" &&
            update.intern.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // Only Admin or owning Intern can delete
        if (
            req.user.role !== "ADMIN" &&
            req.user.role !== "INTERN"
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        await DailyUpdate.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Daily update deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Daily update deletion failed",
            error: error.message
        });
    }
};
