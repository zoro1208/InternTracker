import express from "express";

import {
    createCompany,
    getCompanies,
    getCompanyById,
    updateCompany,
    deleteCompany
} from "../controllers/companyController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();


// CREATE
router.post(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    createCompany
);


// READ ALL
router.get(
    "/",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getCompanies
);


// READ ONE
router.get(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    getCompanyById
);


// UPDATE
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    updateCompany
);


// DELETE
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("ADMIN"),
    deleteCompany
);


export default router;