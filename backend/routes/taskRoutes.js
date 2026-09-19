import express from "express";

import {
    broadcastTask,
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} from "../controllers/taskController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// ======================================================
// MENTOR broadcasts a task to interns in an internship
// ======================================================

router.post(
    "/broadcast",
    authMiddleware,
    roleMiddleware("MENTOR"),
    broadcastTask
);


// ======================================================
// INTERN creates their own task
// ======================================================

router.post(
    "/",
    authMiddleware,
    roleMiddleware("INTERN"),
    createTask
);


// ======================================================
// ADMIN, MENTOR and INTERN can view tasks
// ======================================================

router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR", "INTERN"),
    getTasks
);


// ======================================================
// View one task
// ======================================================

router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR", "INTERN"),
    getTaskById
);


// ======================================================
// ADMIN, MENTOR and INTERN can update
// Controller controls what each role can modify
// ======================================================

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR", "INTERN"),
    updateTask
);


// ======================================================
// ADMIN and MENTOR can delete
// ======================================================

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR"),
    deleteTask
);


export default router;