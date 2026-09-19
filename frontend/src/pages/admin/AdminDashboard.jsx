import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [companies, setCompanies] = useState([]);
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const [companiesResponse, internshipsResponse] =
                await Promise.all([
                    api.get("/api/companies"),
                    api.get("/api/internships")
                ]);

            setCompanies(
                companiesResponse.data.companies || []
            );

            setInternships(
                internshipsResponse.data.internships || []
            );

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load dashboard data"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    if (loading) {
        return <p>Loading dashboard...</p>;
    }

    return (
        <div>

            <header>
                <h1>InternTracker</h1>

                <div>
                    <span>
                        Welcome, {user?.name}
                    </span>

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main>

                <h2>Admin Dashboard</h2>

                {error && (
                    <p>
                        {error}
                    </p>
                )}

                {/* Summary Cards */}
                <section>

                    <div>
                        <h3>Companies</h3>
                        <p>{companies.length}</p>
                    </div>

                    <div>
                        <h3>Internships</h3>
                        <p>{internships.length}</p>
                    </div>

                    <div>
                        <h3>Active Internships</h3>
                        <p>
                            {
                                internships.filter(
                                    (internship) =>
                                        internship.status === "ACTIVE"
                                ).length
                            }
                        </p>
                    </div>

                    <div>
                        <h3>Upcoming Internships</h3>
                        <p>
                            {
                                internships.filter(
                                    (internship) =>
                                        internship.status === "UPCOMING"
                                ).length
                            }
                        </p>
                    </div>

                </section>

                {/* Admin Actions */}
                <section>

                    <h2>Management</h2>

                    <button
                        onClick={() =>
                            navigate("/admin/companies")
                        }
                    >
                        Manage Companies
                    </button>

                    <button
                        onClick={() =>
                            navigate("/admin/users")
                        }
                    >
                        Manage Users
                    </button>

                    <button
                        onClick={() =>
                            navigate("/admin/internships")
                        }
                    >
                        Manage Internships
                    </button>

                    <button
                        onClick={() =>
                            navigate("/admin/reports")
                        }
                    >
                        View Reports
                    </button>

                </section>

                {/* Recent Internships */}
                <section>

                    <h2>Internships</h2>

                    {internships.length === 0 ? (
                        <p>No internships found.</p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Company</th>
                                    <th>Intern</th>
                                    <th>Mentor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {internships
                                    .slice(0, 5)
                                    .map((internship) => (
                                        <tr key={internship._id}>
                                            <td>
                                                {internship.title}
                                            </td>

                                            <td>
                                                {internship.company?.name ||
                                                    "N/A"}
                                            </td>

                                            <td>
                                                {internship.intern?.name ||
                                                    "N/A"}
                                            </td>

                                            <td>
                                                {internship.mentor?.name ||
                                                    "N/A"}
                                            </td>

                                            <td>
                                                {internship.status}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}

                </section>

            </main>

        </div>
    );
};

export default AdminDashboard;