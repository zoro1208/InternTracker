import Internship from "../models/Internship.js";
import User from "../models/User.js";
import Company from "../models/company.js";


// CREATE INTERNSHIP
export const createInternship = async (req, res) => {
    try {
        const {
            title,
            description,
            company,
            mentor,
            intern,
            startDate,
            endDate,
            status
        } = req.body;


        // Validate required fields
        if (!title || !company || !mentor || !intern || !startDate) {
            return res.status(400).json({
                message: "Title, company, mentor, intern and start date are required"
            });
        }


        // Check company
        const companyExists = await Company.findById(company);

        if (!companyExists) {
            return res.status(404).json({
                message: "Company not found"
            });
        }


        // Check mentor
        const mentorUser = await User.findById(mentor);

        if (!mentorUser) {
            return res.status(404).json({
                message: "Mentor not found"
            });
        }

        if (mentorUser.role !== "MENTOR") {
            return res.status(400).json({
                message: "Selected user is not a mentor"
            });
        }


        // Check intern
        const internUser = await User.findById(intern);

        if (!internUser) {
            return res.status(404).json({
                message: "Intern not found"
            });
        }

        if (internUser.role !== "INTERN") {
            return res.status(400).json({
                message: "Selected user is not an intern"
            });
        }


        // Check mentor company
        if (
            !mentorUser.company ||
            mentorUser.company.toString() !== company
        ) {
            return res.status(400).json({
                message: "Mentor does not belong to this company"
            });
        }


        // Check intern company
        if (
            !internUser.company ||
            internUser.company.toString() !== company
        ) {
            return res.status(400).json({
                message: "Intern does not belong to this company"
            });
        }


        // Validate dates
        const start = new Date(startDate);

        if (isNaN(start.getTime())) {
            return res.status(400).json({
                message: "Invalid start date"
            });
        }


        if (endDate) {
            const end = new Date(endDate);

            if (isNaN(end.getTime())) {
                return res.status(400).json({
                    message: "Invalid end date"
                });
            }

            if (end < start) {
                return res.status(400).json({
                    message: "End date cannot be before start date"
                });
            }
        }


        // Create internship
        const internship = await Internship.create({
            title,
            description,
            company,
            mentor,
            intern,
            startDate,
            endDate: endDate || null,
            status: status || "UPCOMING"
        });


        // Populate references
        await internship.populate([
            {
                path: "company",
                select: "name location"
            },
            {
                path: "mentor",
                select: "name email role"
            },
            {
                path: "intern",
                select: "name email role"
            }
        ]);


        res.status(201).json({
            message: "Internship created successfully",
            internship
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create internship",
            error: error.message
        });
    }
};


// GET ALL INTERNSHIPS
export const getInternships = async (req, res) => {
    try {
        const internships = await Internship.find()
            .populate("company", "name location")
            .populate("mentor", "name email")
            .populate("intern", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: internships.length,
            internships
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch internships",
            error: error.message
        });
    }
};


// GET INTERNSHIP BY ID
export const getInternshipById = async (req, res) => {
    try {
        const internship = await Internship.findById(req.params.id)
            .populate("company", "name location")
            .populate("mentor", "name email")
            .populate("intern", "name email");

        if (!internship) {
            return res.status(404).json({
                message: "Internship not found"
            });
        }

        res.status(200).json({
            internship
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch internship",
            error: error.message
        });
    }
};


// UPDATE INTERNSHIP
export const updateInternship = async (req, res) => {
    try {
        const internship = await Internship.findById(
            req.params.id
        );

        if (!internship) {
            return res.status(404).json({
                message: "Internship not found"
            });
        }


        const {
            title,
            description,
            company,
            mentor,
            intern,
            startDate,
            endDate,
            status
        } = req.body;


        const newCompany = company || internship.company;
        const newMentor = mentor || internship.mentor;
        const newIntern = intern || internship.intern;
        const newStartDate = startDate || internship.startDate;


        // Check company
        const companyExists = await Company.findById(newCompany);

        if (!companyExists) {
            return res.status(404).json({
                message: "Company not found"
            });
        }


        // Check mentor
        const mentorUser = await User.findById(newMentor);

        if (!mentorUser || mentorUser.role !== "MENTOR") {
            return res.status(400).json({
                message: "Invalid mentor"
            });
        }


        // Check intern
        const internUser = await User.findById(newIntern);

        if (!internUser || internUser.role !== "INTERN") {
            return res.status(400).json({
                message: "Invalid intern"
            });
        }


        // Check same company
        if (
            !mentorUser.company ||
            mentorUser.company.toString() !== newCompany.toString()
        ) {
            return res.status(400).json({
                message: "Mentor does not belong to this company"
            });
        }


        if (
            !internUser.company ||
            internUser.company.toString() !== newCompany.toString()
        ) {
            return res.status(400).json({
                message: "Intern does not belong to this company"
            });
        }


        // Date validation
        const start = new Date(newStartDate);

        if (endDate) {
            const end = new Date(endDate);

            if (end < start) {
                return res.status(400).json({
                    message: "End date cannot be before start date"
                });
            }
        }


        // Update
        internship.title = title ?? internship.title;
        internship.description = description ?? internship.description;
        internship.company = newCompany;
        internship.mentor = newMentor;
        internship.intern = newIntern;
        internship.startDate = newStartDate;

        if (endDate !== undefined) {
            internship.endDate = endDate || null;
        }

        if (status !== undefined) {
            internship.status = status;
        }


        await internship.save();


        await internship.populate([
            {
                path: "company",
                select: "name location"
            },
            {
                path: "mentor",
                select: "name email role"
            },
            {
                path: "intern",
                select: "name email role"
            }
        ]);


        res.status(200).json({
            message: "Internship updated successfully",
            internship
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to update internship",
            error: error.message
        });
    }
};


// DELETE INTERNSHIP
export const deleteInternship = async (req, res) => {
    try {
        const internship = await Internship.findByIdAndDelete(
            req.params.id
        );

        if (!internship) {
            return res.status(404).json({
                message: "Internship not found"
            });
        }

        res.status(200).json({
            message: "Internship deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete internship",
            error: error.message
        });
    }
};

// Get internships assigned to the logged-in Mentor or Intern
export const getMyInternships = async (req, res) => {
    try {
        let filter = {};

        if (req.user.role === "MENTOR") {
            filter.mentor = req.user._id;
        } else if (req.user.role === "INTERN") {
            filter.intern = req.user._id;
        } else {
            return res.status(403).json({
                message: "This route is only available to Mentors and Interns"
            });
        }

        const internships = await Internship.find(filter)
            .populate("company", "name")
            .populate("mentor", "name email")
            .populate("intern", "name email")
            .sort({ startDate: -1 });

        res.status(200).json({
            count: internships.length,
            internships
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your internships",
            error: error.message
        });
    }
};