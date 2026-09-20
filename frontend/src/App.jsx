import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Register from "./pages/Registration.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import CompanyManagement from "./pages/admin/AdminCompanies.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminInternships from "./pages/admin/AdminInternships.jsx";
import AdminReports from "./pages/admin/AdminReports.jsx";

import MentorDashboard from "./pages/mentor/MentorDashboard.jsx";
import MentorInterns from "./pages/mentor/MentorInterns.jsx";
import MentorTasks from "./pages/mentor/MentorTasks.jsx";
import MentorEvaluations from "./pages/mentor/MentorEvaluations.jsx";
import MentorReports from "./pages/mentor/MentorReports.jsx";

import InternDashboard from "./pages/intern/InternDashboard.jsx";
import InternTaskManagement from "./pages/intern/InternTaskManagement.jsx";
import InternDailyUpdates from "./pages/intern/InternDailyUpdates.jsx";
import InternReports from "./pages/intern/InternReports.jsx";

const App = () => {
    return (
        <Routes>

            {/* Default route */}
            <Route
                path="/"
                element={<Navigate to="/login" replace />}
            />

            {/* Public route */}
            <Route
                path="/login"
                element={<Login />}
            />
            <Route
                path="/register"
                element={<Register />}
            />

            {/* ==================== ADMIN ==================== */}

            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/companies"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <CompanyManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/users"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminUsers />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/internships"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminInternships />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/reports"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminReports />
                    </ProtectedRoute>
                }
            />

            {/* ==================== MENTOR ==================== */}

            <Route
                path="/mentor/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["MENTOR"]}>
                        <MentorDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/mentor/interns"
                element={
                    <ProtectedRoute allowedRoles={["MENTOR"]}>
                        <MentorInterns />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/mentor/tasks"
                element={
                    <ProtectedRoute allowedRoles={["MENTOR"]}>
                        <MentorTasks />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/mentor/evaluations"
                element={
                    <ProtectedRoute allowedRoles={["MENTOR"]}>
                        <MentorEvaluations />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/mentor/reports"
                element={
                    <ProtectedRoute allowedRoles={["MENTOR"]}>
                        <MentorReports />
                    </ProtectedRoute>
                }
            />

            {/* ==================== INTERN ==================== */}

            <Route
                path="/intern/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["INTERN"]}>
                        <InternDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/intern/tasks"
                element={
                    <ProtectedRoute allowedRoles={["INTERN"]}>
                        <InternTaskManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/intern/daily-updates"
                element={
                    <ProtectedRoute allowedRoles={["INTERN"]}>
                        <InternDailyUpdates />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/intern/reports"
                element={
                    <ProtectedRoute allowedRoles={["INTERN"]}>
                        <InternReports />
                    </ProtectedRoute>
                }
            />

            {/* Unknown route */}
            <Route
                path="*"
                element={<Navigate to="/login" replace />}
            />

        </Routes>
    );
};

export default App;