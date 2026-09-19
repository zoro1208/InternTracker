import Report from "../models/Report.js";
import Internship from "../models/Internship.js";
import DailyUpdate from "../models/DailyUpdate.js";
import Task from "../models/Task.js";
import Evaluation from "../models/Evaluation.js";
import User from "../models/User.js";


// Convert date to UTC start of day
const startOfDayUTC = (date) => {
    const d = new Date(date);

    return new Date(
        Date.UTC(
            d.getUTCFullYear(),
            d.getUTCMonth(),
            d.getUTCDate()
        )
    );
};


// Convert date to UTC end of day
const endOfDayUTC = (date) => {
    const d = new Date(date);

    return new Date(
        Date.UTC(
            d.getUTCFullYear(),
            d.getUTCMonth(),
            d.getUTCDate(),
            23,
            59,
            59,
            999
        )
    );
};


// Check whether date is Saturday or Sunday
const isWeekend = (date) => {
    const day = new Date(date).getUTCDay();

    return day === 0 || day === 6;
};


// Get day name
const getDayName = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        timeZone: "UTC"
    });
};


// Generate Report
export const generateReport = async (req, res) => {
    try {
        const {
            internship,
            periodType,
            periodStart,
            periodEnd
        } = req.body;

        if (
            !internship ||
            !periodType ||
            !periodStart ||
            !periodEnd
        ) {
            return res.status(400).json({
                message:
                    "Internship, periodType, periodStart and periodEnd are required"
            });
        }

        if (!["WEEKLY", "MONTHLY"].includes(periodType)) {
            return res.status(400).json({
                message: "periodType must be WEEKLY or MONTHLY"
            });
        }

        let start = startOfDayUTC(periodStart);
        let end = endOfDayUTC(periodEnd);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({
                message: "Invalid report dates"
            });
        }

        if (end < start) {
            return res.status(400).json({
                message: "periodEnd cannot be before periodStart"
            });
        }

        // Find internship
        const internshipExists = await Internship.findById(internship)
            .populate("intern", "name email role company")
            .populate("mentor", "name email role company")
            .populate("company", "name");

        if (!internshipExists) {
            return res.status(404).json({
                message: "Internship not found"
            });
        }

        const internId = internshipExists.intern._id;
        const mentorId = internshipExists.mentor._id;

        // ---------------------------------------------------------
        // ACCESS CONTROL
        // ---------------------------------------------------------

        // Intern can generate only own report
        if (
            req.user.role === "INTERN" &&
            req.user._id.toString() !== internId.toString()
        ) {
            return res.status(403).json({
                message: "You can only generate your own report"
            });
        }

        // Mentor can generate reports only for assigned interns
        if (
            req.user.role === "MENTOR" &&
            req.user._id.toString() !== mentorId.toString()
        ) {
            return res.status(403).json({
                message:
                    "You can only generate reports for your assigned interns"
            });
        }

        // ---------------------------------------------------------
        // LIMIT REPORT PERIOD TO INTERNSHIP PERIOD
        // ---------------------------------------------------------

        const internshipStart = startOfDayUTC(
            internshipExists.startDate
        );

        if (start < internshipStart) {
            start = internshipStart;
        }

        if (internshipExists.endDate) {
            const internshipEnd = endOfDayUTC(
                internshipExists.endDate
            );

            if (end > internshipEnd) {
                end = internshipEnd;
            }
        }

        if (end < start) {
            return res.status(400).json({
                message:
                    "Report period does not overlap with the internship period"
            });
        }

        // ---------------------------------------------------------
        // GET DAILY UPDATES
        // ---------------------------------------------------------

        const dailyUpdates = await DailyUpdate.find({
            internship: internship,
            intern: internId,
            date: {
                $gte: start,
                $lte: end
            }
        }).sort({ date: 1 });

        // ---------------------------------------------------------
        // DAY-BY-DAY CALCULATION
        // ---------------------------------------------------------

        let totalWorkingDays = 0;
        let submittedUpdateDays = 0;
        let missingUpdateDays = 0;

        let totalExpectedHours = 0;
        let totalActualHours = 0;
        let overtimeHours = 0;
        let weekendHours = 0;

        const dailyBreakdown = [];

        const updateMap = new Map();

        dailyUpdates.forEach((update) => {
            const key = startOfDayUTC(update.date)
                .toISOString()
                .split("T")[0];

            updateMap.set(key, update);
        });

        let currentDate = new Date(start);

        while (currentDate <= end) {
            const currentDay = startOfDayUTC(currentDate);
            const key = currentDay.toISOString().split("T")[0];

            const weekend = isWeekend(currentDay);
            const update = updateMap.get(key);

            let hoursWorked = 0;

            if (update) {
                hoursWorked = Number(update.hoursWorked) || 0;
            }

            totalActualHours += hoursWorked;

            if (!weekend) {
                // Monday-Friday
                totalWorkingDays++;
                totalExpectedHours += 8;

                if (update) {
                    submittedUpdateDays++;

                    const dailyOvertime = Math.max(
                        hoursWorked - 8,
                        0
                    );

                    overtimeHours += dailyOvertime;

                    dailyBreakdown.push({
                        date: currentDay,
                        day: getDayName(currentDay),
                        dayType: "WEEKDAY",
                        updateSubmitted: true,
                        hoursWorked,
                        overtimeHours: dailyOvertime,
                        status: "SUBMITTED"
                    });
                } else {
                    missingUpdateDays++;

                    dailyBreakdown.push({
                        date: currentDay,
                        day: getDayName(currentDay),
                        dayType: "WEEKDAY",
                        updateSubmitted: false,
                        hoursWorked: 0,
                        overtimeHours: 0,
                        status: "MISSING"
                    });
                }
            } else {
                // Saturday / Sunday
                weekendHours += hoursWorked;

                if (update && hoursWorked > 0) {
                    dailyBreakdown.push({
                        date: currentDay,
                        day: getDayName(currentDay),
                        dayType: "WEEKEND",
                        updateSubmitted: true,
                        hoursWorked,
                        overtimeHours: 0,
                        status: "WEEKEND_WORK"
                    });
                } else {
                    dailyBreakdown.push({
                        date: currentDay,
                        day: getDayName(currentDay),
                        dayType: "WEEKEND",
                        updateSubmitted: false,
                        hoursWorked: 0,
                        overtimeHours: 0,
                        status: "NO_WORK"
                    });
                }
            }

            currentDate.setUTCDate(
                currentDate.getUTCDate() + 1
            );
        }

        // ---------------------------------------------------------
        // GET TASKS
        // ---------------------------------------------------------

        const tasks = await Task.find({
            internship: internship,
            assignedTo: internId,
            dueDate: {
                $gte: start,
                $lte: end
            }
        });

        const totalTasks = tasks.length;

        const completedTasks = tasks.filter(
            (task) => task.status === "COMPLETED"
        ).length;

        const pendingTasks = tasks.filter(
            (task) => task.status === "PENDING"
        ).length;

        const inProgressTasks = tasks.filter(
            (task) => task.status === "IN_PROGRESS"
        ).length;

        const delayedTasks = tasks.filter(
            (task) => task.status === "DELAYED"
        ).length;

        const averageTaskProgress =
            totalTasks > 0
                ? Number(
                    (
                        tasks.reduce(
                            (total, task) =>
                                total + (Number(task.progress) || 0),
                            0
                        ) / totalTasks
                    ).toFixed(2)
                )
                : 0;

        // ---------------------------------------------------------
        // FIND EVALUATION FOR THIS PERIOD
        // ---------------------------------------------------------

        const evaluation = await Evaluation.findOne({
            internship: internship,
            intern: internId,
            periodType: periodType,
            periodStart: {
                $lte: end
            },
            periodEnd: {
                $gte: start
            }
        }).sort({ createdAt: -1 });

        // ---------------------------------------------------------
        // REPORT DATA
        // ---------------------------------------------------------

        const reportData = {
            internship,
            intern: internId,
            generatedBy: req.user._id,

            periodType,
            periodStart: start,
            periodEnd: end,

            totalWorkingDays,
            submittedUpdateDays,
            missingUpdateDays,

            totalExpectedHours,
            totalActualHours,
            overtimeHours,
            weekendHours,

            totalTasks,
            completedTasks,
            pendingTasks,
            inProgressTasks,
            delayedTasks,
            averageTaskProgress,

            evaluationScore: evaluation
                ? evaluation.finalScore
                : null,

            communication: evaluation
                ? evaluation.communication
                : null,

            technicalSkill: evaluation
                ? evaluation.technicalSkill
                : null,

            punctuality: evaluation
                ? evaluation.punctuality
                : null,

            taskCompletion: evaluation
                ? evaluation.taskCompletion
                : null,

            teamwork: evaluation
                ? evaluation.teamwork
                : null,

            dailyBreakdown
        };

        // ---------------------------------------------------------
        // CREATE OR UPDATE REPORT
        // ---------------------------------------------------------

        const report = await Report.findOneAndUpdate(
            {
                internship,
                intern: internId,
                periodType,
                periodStart: start,
                periodEnd: end
            },
            reportData,
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        )
            .populate("internship", "title")
            .populate("intern", "name email")
            .populate("generatedBy", "name email role");

        res.status(200).json({
            message: "Report generated successfully",
            report
        });

    } catch (error) {
        res.status(500).json({
            message: "Report generation failed",
            error: error.message
        });
    }
};


// Get Reports
export const getReports = async (req, res) => {
    try {
        let filter = {};

        // Intern → own reports
        if (req.user.role === "INTERN") {
            filter.intern = req.user._id;
        }

        // Mentor → reports generated for their internships
        if (req.user.role === "MENTOR") {
            const internships = await Internship.find({
                mentor: req.user._id
            }).select("_id");

            filter.internship = {
                $in: internships.map(
                    (internship) => internship._id
                )
            };
        }

        const reports = await Report.find(filter)
            .populate("internship", "title")
            .populate("intern", "name email")
            .populate("generatedBy", "name email role")
            .sort({ periodStart: -1 });

        res.status(200).json({
            count: reports.length,
            reports
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch reports",
            error: error.message
        });
    }
};


// Get Report by ID
export const getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate("internship", "title mentor intern company")
            .populate("intern", "name email")
            .populate("generatedBy", "name email role");

        if (!report) {
            return res.status(404).json({
                message: "Report not found"
            });
        }

        // Intern → own report only
        if (
            req.user.role === "INTERN" &&
            report.intern._id.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        // Mentor → assigned internship only
        if (
            req.user.role === "MENTOR" &&
            report.internship.mentor.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        res.status(200).json({
            report
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch report",
            error: error.message
        });
    }
};


// Delete Report
export const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate("internship", "mentor");

        if (!report) {
            return res.status(404).json({
                message: "Report not found"
            });
        }

        // Only Admin or assigned Mentor can delete
        if (
            req.user.role !== "ADMIN" &&
            (
                req.user.role !== "MENTOR" ||
                report.internship.mentor.toString() !==
                req.user._id.toString()
            )
        ) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        await Report.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Report deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Report deletion failed",
            error: error.message
        });
    }
};