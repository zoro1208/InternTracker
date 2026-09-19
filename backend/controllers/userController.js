import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Company from "../models/company.js";

// Admin creates a Mentor or Intern
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, company } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "Name, email, password and role are required"
            });
        }

        if (!["MENTOR", "INTERN"].includes(role)) {
            return res.status(400).json({
                message: "Only MENTOR or INTERN can be created"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        if (!company) {
            return res.status(400).json({
                message: "Company is required"
            });
        }

        const companyExists = await Company.findById(company);

        if (!companyExists) {
            return res.status(404).json({
                message: "Company not found"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            company
        });

        res.status(201).json({
            message: `${role} created successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                company: user.company
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "User creation failed",
            error: error.message
        });
    }
};
// Get all Mentor and Intern users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find({
            role: { $in: ["MENTOR", "INTERN"] }
        })
            .select("-password")
            .populate("company", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};


// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password")
            .populate("company", "name");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role === "ADMIN") {
            return res.status(403).json({
                message: "Admin users cannot be managed through this endpoint"
            });
        }

        res.status(200).json({
            user
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch user",
            error: error.message
        });
    }
};


// Update Mentor or Intern
export const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role === "ADMIN") {
            return res.status(403).json({
                message: "Admin users cannot be managed through this endpoint"
            });
        }

        const {
            name,
            email,
            password,
            role,
            company
        } = req.body;

        if (role !== undefined &&
            !["MENTOR", "INTERN"].includes(role)) {
            return res.status(400).json({
                message: "Role must be MENTOR or INTERN"
            });
        }

        if (email !== undefined) {
            const existingUser = await User.findOne({
                email,
                _id: { $ne: user._id }
            });

            if (existingUser) {
                return res.status(400).json({
                    message: "Email already exists"
                });
            }

            user.email = email;
        }

        if (name !== undefined) {
            user.name = name;
        }

        if (role !== undefined) {
            user.role = role;
        }

        if (company !== undefined) {
            const companyExists = await Company.findById(company);

            if (!companyExists) {
                return res.status(404).json({
                    message: "Company not found"
                });
            }

            user.company = company;
        }

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        if (!user.company) {
            return res.status(400).json({
                message: "Company is required"
            });
        }

        await user.save();

        const updatedUser = await User.findById(user._id)
            .select("-password")
            .populate("company", "name");

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            message: "User update failed",
            error: error.message
        });
    }
};


// Delete Mentor or Intern
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role === "ADMIN") {
            return res.status(403).json({
                message: "Admin users cannot be deleted through this endpoint"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "User deletion failed",
            error: error.message
        });
    }
};