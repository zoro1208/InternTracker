import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import internshipRoutes from "./routes/internshipRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import dailyUpdateRoutes from "./routes/dailyUpdateRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes)
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/daily-updates", dailyUpdateRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/reports", reportRoutes);


// Test route
app.get("/", (req, res) => {
    res.json({
        message: "InternTracker API is running"
    });
});

const PORT = process.env.PORT || 5000;

// Connect MongoDB first, then start server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    });