// import Company from "./models/Company.js";

import Company from "../models/company.js";
import User from "../models/User.js";

// CREATE COMPANY
export const createCompany = async (req, res) => {
    try {
        const {
            name,
            description,
            location,
            website,
            contactEmail,
            contactPhone
        } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Company name is required"
            });
        }

        const existingCompany = await Company.findOne({ name });

        if (existingCompany) {
            return res.status(400).json({
                message: "Company already exists"
            });
        }

        const company = await Company.create({
            name,
            description,
            location,
            website,
            contactEmail,
            contactPhone
        });

        res.status(201).json({
            message: "Company created successfully",
            company
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create company",
            error: error.message
        });
    }
};


// GET ALL COMPANIES
export const getCompanies = async (req, res) => {
    try {
        const companies = await Company.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: companies.length,
            companies
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch companies",
            error: error.message
        });
    }
};


// GET COMPANY BY ID
export const getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        res.status(200).json({
            company
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch company",
            error: error.message
        });
    }
};


// UPDATE COMPANY
export const updateCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        res.status(200).json({
            message: "Company updated successfully",
            company
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update company",
            error: error.message
        });
    }
};


// DELETE COMPANY
export const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(
            req.params.id
        );

        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        res.status(200).json({
            message: "Company deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete company",
            error: error.message
        });
    }
};