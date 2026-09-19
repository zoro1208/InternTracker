import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        location: {
            type: String,
            trim: true
        },

        website: {
            type: String,
            trim: true
        },

        contactEmail: {
            type: String,
            trim: true,
            lowercase: true
        },

        contactPhone: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

const Company = mongoose.model("Company", companySchema);

export default Company;