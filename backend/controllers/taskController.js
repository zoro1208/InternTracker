import Task from "../models/Task.js";
import Internship from "../models/Internship.js";
import User from "../models/User.js";


// ======================================================
// Broadcast Task
// MENTOR creates one task for all interns in their
// assigned internships.
//
// Each intern receives a separate Task document so that
// status, progress and hours can be tracked independently.
// ======================================================

export const broadcastTask = async (req, res) => {
    try {
        const {
            internship,
            title,
            description,
            dueDate
        } = req.body;


        // Validate required fields
        if (
            !internship ||
            !title ||
            !dueDate
        ) {
            return res.status(400).json({
                message:
                    "Internship, title and dueDate are required"
            });
        }


        // Find internship
        const internshipExists =
            await Internship.findById(internship);


        if (!internshipExists) {
            return res.status(404).json({
                message:
                    "Internship not found"
            });
        }


        // Only the mentor assigned to the internship
        // can broadcast tasks
        if (
            req.user.role !== "MENTOR" ||
            internshipExists.mentor.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only broadcast tasks for your own internship"
            });
        }


        // Get all interns belonging to this internship
        const interns = await User.find({
            _id: internshipExists.intern,
            role: "INTERN"
        }).select("_id name email");


        if (interns.length === 0) {
            return res.status(400).json({
                message:
                    "No intern is assigned to this internship"
            });
        }


        // Generate one ID for this broadcast
        const broadcastId = new Task()._id;


        // Create one task for each intern
        const taskData = interns.map((intern) => ({
            internship,
            title,
            description,
            assignedTo: intern._id,
            dueDate,
            isBroadcast: true,
            broadcastId
        }));


        const tasks =
            await Task.insertMany(taskData);


        // Return populated tasks
        const populatedTasks =
            await Task.find({
                _id: {
                    $in: tasks.map(
                        (task) => task._id
                    )
                }
            })
            .populate(
                "internship",
                "title"
            )
            .populate(
                "assignedTo",
                "name email"
            );


        res.status(201).json({
            message:
                "Task broadcasted successfully",
            count: populatedTasks.length,
            tasks: populatedTasks
        });

    } catch (error) {

        res.status(500).json({
            message:
                "Task broadcast failed",
            error: error.message
        });
    }
};

export const createTask = async (req, res) => {
    try {
        const {
            internship,
            title,
            description,
            dueDate
        } = req.body;

        if (!internship || !title || !dueDate) {
            return res.status(400).json({
                message:
                    "Internship, title and dueDate are required"
            });
        }

        const internshipExists = await Internship.findById(
            internship
        );

        if (!internshipExists) {
            return res.status(404).json({
                message: "Internship not found"
            });
        }

        // Intern must belong to the internship
        if (
            internshipExists.intern.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only create tasks for your own internship"
            });
        }

        const task = await Task.create({
            internship,
            title,
            description,
            assignedTo: req.user._id,
            dueDate
        });

        const populatedTask = await Task.findById(task._id)
            .populate("internship", "title")
            .populate("assignedTo", "name email");

        res.status(201).json({
            message: "Task created successfully",
            task: populatedTask
        });

    } catch (error) {
        res.status(500).json({
            message: "Task creation failed",
            error: error.message
        });
    }
};

// ======================================================
// Get Tasks
//
// INTERN → sees only their tasks
// MENTOR → sees tasks belonging to their internships
// ADMIN → sees all tasks
// ======================================================

export const getTasks = async (req, res) => {
    try {

        let filter = {};


        // INTERN
        if (req.user.role === "INTERN") {

            filter.assignedTo =
                req.user._id;
        }


        // MENTOR
        else if (req.user.role === "MENTOR") {

            const internships =
                await Internship.find({
                    mentor: req.user._id
                }).select("_id");


            filter.internship = {
                $in: internships.map(
                    (internship) =>
                        internship._id
                )
            };
        }


        // ADMIN gets all tasks


        const tasks =
            await Task.find(filter)
                .populate(
                    "internship",
                    "title"
                )
                .populate(
                    "assignedTo",
                    "name email"
                )
                .sort({
                    dueDate: 1
                });


        res.status(200).json({
            count: tasks.length,
            tasks
        });

    } catch (error) {

        res.status(500).json({
            message:
                "Failed to fetch tasks",
            error: error.message
        });
    }
};



// ======================================================
// Get Task By ID
// ======================================================

export const getTaskById = async (req, res) => {
    try {

        const task =
            await Task.findById(
                req.params.id
            )
            .populate(
                "internship",
                "title mentor intern company"
            )
            .populate(
                "assignedTo",
                "name email"
            );


        if (!task) {
            return res.status(404).json({
                message:
                    "Task not found"
            });
        }


        // INTERN can only see their own task
        if (
            req.user.role === "INTERN" &&
            task.assignedTo._id.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "Access denied"
            });
        }


        // MENTOR can only see tasks from
        // their own internships
        if (
            req.user.role === "MENTOR" &&
            task.internship.mentor.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message:
                    "Access denied"
            });
        }


        res.status(200).json({
            task
        });

    } catch (error) {

        res.status(500).json({
            message:
                "Failed to fetch task",
            error: error.message
        });
    }
};



// ======================================================
// Update Task
//
// INTERN:
//   - status
//   - progress
//   - hoursSpent
//
// MENTOR:
//   - title
//   - description
//   - dueDate
//
// ADMIN:
//   - can update everything
// ======================================================

export const updateTask = async (req, res) => {
    try {

        const task =
            await Task.findById(
                req.params.id
            );


        if (!task) {
            return res.status(404).json({
                message:
                    "Task not found"
            });
        }


        const {
            title,
            description,
            dueDate,
            status,
            progress,
            hoursSpent
        } = req.body;



        // ==================================================
        // INTERN
        // ==================================================

        if (req.user.role === "INTERN") {

            // Intern can only update their own task
            if (
                task.assignedTo.toString() !==
                req.user._id.toString()
            ) {
                return res.status(403).json({
                    message:
                        "You can only update your own tasks"
                });
            }


            // Intern updates only execution information

            if (status !== undefined) {
                task.status = status;
            }


            if (progress !== undefined) {
                task.progress = progress;
            }


            if (hoursSpent !== undefined) {
                task.hoursSpent =
                    hoursSpent;
            }
        }



        // ==================================================
        // MENTOR
        // ==================================================

        else if (req.user.role === "MENTOR") {

            const internship =
                await Internship.findById(
                    task.internship
                );


            if (!internship) {
                return res.status(404).json({
                    message:
                        "Internship not found"
                });
            }


            // Mentor must own the internship
            if (
                internship.mentor.toString() !==
                req.user._id.toString()
            ) {
                return res.status(403).json({
                    message:
                        "Access denied"
                });
            }


            // Mentor can modify task details

            if (title !== undefined) {
                task.title = title;
            }


            if (description !== undefined) {
                task.description =
                    description;
            }


            if (dueDate !== undefined) {
                task.dueDate =
                    dueDate;
            }
        }



        // ==================================================
        // ADMIN
        // ==================================================

        else if (req.user.role === "ADMIN") {

            if (title !== undefined) {
                task.title = title;
            }


            if (description !== undefined) {
                task.description =
                    description;
            }


            if (dueDate !== undefined) {
                task.dueDate =
                    dueDate;
            }


            if (status !== undefined) {
                task.status =
                    status;
            }


            if (progress !== undefined) {
                task.progress =
                    progress;
            }


            if (hoursSpent !== undefined) {
                task.hoursSpent =
                    hoursSpent;
            }
        }


        else {
            return res.status(403).json({
                message:
                    "Access denied"
            });
        }


        await task.save();


        const updatedTask =
            await Task.findById(
                task._id
            )
            .populate(
                "internship",
                "title"
            )
            .populate(
                "assignedTo",
                "name email"
            );


        res.status(200).json({
            message:
                "Task updated successfully",
            task: updatedTask
        });

    } catch (error) {

        res.status(500).json({
            message:
                "Task update failed",
            error: error.message
        });
    }
};



// ======================================================
// Delete Task
//
// MENTOR → can delete tasks from own internships
// ADMIN → can delete any task
// INTERN → cannot delete tasks
// ======================================================

export const deleteTask = async (req, res) => {
    try {

        const task =
            await Task.findById(
                req.params.id
            );


        if (!task) {
            return res.status(404).json({
                message:
                    "Task not found"
            });
        }


        // ==================================================
        // ADMIN
        // ==================================================

        if (req.user.role === "ADMIN") {

            await Task.findByIdAndDelete(
                req.params.id
            );


            return res.status(200).json({
                message:
                    "Task deleted successfully"
            });
        }



        // ==================================================
        // MENTOR
        // ==================================================

        if (req.user.role === "MENTOR") {

            const internship =
                await Internship.findById(
                    task.internship
                );


            if (
                !internship ||
                internship.mentor.toString() !==
                req.user._id.toString()
            ) {
                return res.status(403).json({
                    message:
                        "You can only delete tasks from your internships"
                });
            }


            await Task.findByIdAndDelete(
                req.params.id
            );


            return res.status(200).json({
                message:
                    "Task deleted successfully"
            });
        }


        // INTERN cannot delete mentor tasks

        return res.status(403).json({
            message:
                "Interns cannot delete assigned tasks"
        });

    } catch (error) {

        res.status(500).json({
            message:
                "Task deletion failed",
            error: error.message
        });
    }
};
