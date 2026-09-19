import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import CompanyManagement from "./pages/admin/CompanyManagement.jsx";
import UserManagement from "./pages/admin/UserManagement.jsx";
import InternshipManagement from "./pages/admin/InternshipManagement.jsx";
import MentorDashboard from "./pages/mentor/MentorDashboard.jsx";
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

            {/* Admin */}
            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Mentor */}
            <Route
                path="/mentor/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["MENTOR"]}>
                        <MentorDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Intern */}
            <Route
                path="/intern/dashboard"
                element={
                    <ProtectedRoute allowedRoles={["INTERN"]}>
                        <InternDashboard />
                    </ProtectedRoute>
                }
            />

            {/* Unknown route */}
            <Route
                path="*"
                element={<Navigate to="/login" replace />}
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
                   <UserManagement />
                 </ProtectedRoute>
               }
              />
              <Route
    path="/admin/internships"
    element={
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <InternshipManagement />
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
            </Routes>
            
            
    );
};

export default App;