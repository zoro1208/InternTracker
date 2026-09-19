import express from "express";

import {
    createEvaluation,
    getEvaluations,
    getEvaluationById,
    updateEvaluation,
    deleteEvaluation
} from "../controllers/evaluationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// Create evaluation
// Only Mentor
router.post(
    "/",
    authMiddleware,
    roleMiddleware("MENTOR"),
    createEvaluation
);


// Get evaluations
// Admin, Mentor, Intern
router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR", "INTERN"),
    getEvaluations
);


// Get evaluation by ID
// Admin, Mentor, Intern
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR", "INTERN"),
    getEvaluationById
);


// Update evaluation
// Only Mentor
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("MENTOR"),
    updateEvaluation
);


// Delete evaluation
// Admin or Mentor
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR"),
    deleteEvaluation
);


export default router;