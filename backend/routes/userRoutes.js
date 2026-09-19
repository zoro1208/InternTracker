import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from "../controllers/userController.js";

const router = express.Router();


// Any logged-in user
router.get("/profile", authMiddleware, (req, res) => {
    res.json({
        message: "Profile accessed successfully",
        user: req.user
    });
});


// Only ADMIN
router.get(
    "/admin",
    authMiddleware,
    roleMiddleware("ADMIN"),
    (req, res) => {
        res.json({
            message: "Admin route accessed successfully",
            user: req.user
        });
    }
);


// ADMIN or MENTOR
router.get(
    "/mentor-access",
    authMiddleware,
    roleMiddleware("ADMIN", "MENTOR"),
    (req, res) => {
        res.json({
            message: "Admin/Mentor route accessed successfully",
            user: req.user
        });
    }
);


// Only ADMIN can create Mentor or Intern
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    createUser
);

// Admin can view all Mentor and Intern users
router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getUsers
);


// Admin can view one user
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getUserById
);


// Admin can update Mentor or Intern
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateUser
);


// Admin can delete Mentor or Intern
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deleteUser
);

export default router;