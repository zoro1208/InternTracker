import express from "express";

import {
    createInternship,
    getInternships,
    getInternshipById,
    updateInternship,
    deleteInternship,
    getMyInternships
} from "../controllers/internshipController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// CREATE
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    createInternship
);


// READ ALL
router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getInternships
);

router.get(
    "/my",
    authMiddleware,
    roleMiddleware("MENTOR", "INTERN"),
    getMyInternships
);

// READ ONE
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getInternshipById
);


// UPDATE
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateInternship
);


// DELETE
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deleteInternship
);


export default router;