import express from "express";

import {
    generateReport,
    getReports,
    getReportById,
    deleteReport
} from "../controllers/reportController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// Generate weekly/monthly report
// ADMIN, MENTOR, INTERN
router.post(
    "/generate",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR", "INTERN"),
    generateReport
);


// Get accessible reports
// ADMIN, MENTOR, INTERN
router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR", "INTERN"),
    getReports
);


// Get report by ID
// ADMIN, MENTOR, INTERN
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR", "INTERN"),
    getReportById
);


// Delete report
// ADMIN or MENTOR
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR"),
    deleteReport
);


export default router;