import express from "express";

import {
    createDailyUpdate,
    getDailyUpdates,
    getDailyUpdateById,
    updateDailyUpdate,
    deleteDailyUpdate
} from "../controllers/dailyUpdateController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// Intern submits daily update
router.post(
    "/",
    authMiddleware,
    roleMiddleware("INTERN"),
    createDailyUpdate
);


// Admin, Mentor and Intern can view accessible updates
router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR", "INTERN"),
    getDailyUpdates
);


// View a specific daily update
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR", "INTERN"),
    getDailyUpdateById
);


// Intern edits their own update
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("INTERN"),
    updateDailyUpdate
);


// Admin or Intern can delete
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "INTERN"),
    deleteDailyUpdate
);


export default router;