import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import BackButton from "../../components/BackButton.jsx";

const InternDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [internship, setInternship] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [evaluations, setEvaluations] = useState([]);
    const [reports, setReports] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const [
                internshipResponse,
                taskResponse,
                updateResponse,
                evaluationResponse,
                reportResponse
            ] = await Promise.all([
                api.get("/api/internships/my"),
                api.get("/api/tasks"),
                api.get("/api/daily-updates"),
                api.get("/api/evaluations"),
                api.get("/api/reports")
            ]);

            const myInternships =
                internshipResponse.data.internships || [];

            setInternship(myInternships[0] || null);

            setTasks(
                taskResponse.data.tasks || []
            );

            setUpdates(
                updateResponse.data.dailyUpdates || []
            );

            setEvaluations(
                evaluationResponse.data.evaluations || []
            );

            setReports(
                reportResponse.data.reports || []
            );

        } catch (error) {
            console.error("Dashboard error:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString("en-IN");
    };

    const completedTasks = tasks.filter(
        (task) => task.status === "COMPLETED"
    ).length;

    const pendingTasks = tasks.filter(
        (task) => task.status === "PENDING"
    ).length;

    const inProgressTasks = tasks.filter(
        (task) => task.status === "IN_PROGRESS"
    ).length;

    const delayedTasks = tasks.filter(
        (task) => task.status === "DELAYED"
    ).length;

    const averageProgress =
        tasks.length > 0
            ? (
                tasks.reduce(
                    (total, task) =>
                        total + (Number(task.progress) || 0),
                    0
                ) / tasks.length
            ).toFixed(2)
            : 0;

    const mentorAssignedTasks = tasks.filter(
        (task) => task.isBroadcast === true
    ).length;

    const latestEvaluation = [...evaluations].sort(
        (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
    )[0];

    const latestReport = [...reports].sort(
        (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
    )[0];

    if (loading) {
        return (
            <div>
                <BackButton fallback="/login" />
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div>

            <BackButton fallback="/login" />

            {/* Header */}

            <header>
                <div>
                    <h1>InternTracker</h1>
                    <p>
                        Welcome, {user?.name || "Intern"}
                    </p>
                </div>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </header>

            <main>

                <h2>Intern Dashboard</h2>

                {error && (
                    <p>
                        {error}
                    </p>
                )}

                {/* Internship Information */}

                <section>
                    <h2>My Internship</h2>

                    {internship ? (
                        <div>

                            <p>
                                <strong>Title:</strong>{" "}
                                {internship.title}
                            </p>

                            <p>
                                <strong>Company:</strong>{" "}
                                {internship.company?.name || "N/A"}
                            </p>

                            <p>
                                <strong>Mentor:</strong>{" "}
                                {internship.mentor?.name || "N/A"}
                            </p>

                            <p>
                                <strong>Start Date:</strong>{" "}
                                {formatDate(internship.startDate)}
                            </p>

                            <p>
                                <strong>End Date:</strong>{" "}
                                {internship.endDate
                                    ? formatDate(internship.endDate)
                                    : "Ongoing"}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {internship.status}
                            </p>

                        </div>
                    ) : (
                        <p>
                            No internship assigned yet.
                        </p>
                    )}
                </section>

                {/* Summary */}

                <section>
                    <h2>Overview</h2>

                    <div>
                        <h3>Total Tasks</h3>
                        <p>{tasks.length}</p>
                    </div>

                    <div>
                        <h3>Completed</h3>
                        <p>{completedTasks}</p>
                    </div>

                    <div>
                        <h3>In Progress</h3>
                        <p>{inProgressTasks}</p>
                    </div>

                    <div>
                        <h3>Pending</h3>
                        <p>{pendingTasks}</p>
                    </div>

                    <div>
                        <h3>Delayed</h3>
                        <p>{delayedTasks}</p>
                    </div>

                    <div>
                        <h3>Task Progress</h3>
                        <p>{averageProgress}%</p>
                    </div>

                    <div>
                        <h3>Mentor Assigned</h3>
                        <p>{mentorAssignedTasks}</p>
                    </div>

                    <div>
                        <h3>Daily Updates</h3>
                        <p>{updates.length}</p>
                    </div>
                </section>

                {/* Quick Actions */}

                <section>
                    <h2>Quick Actions</h2>

                    <button
                        onClick={() =>
                            navigate("/intern/tasks")
                        }
                    >
                        My Tasks
                    </button>

                    <button
                        onClick={() =>
                            navigate("/intern/daily-updates")
                        }
                    >
                        Daily Updates
                    </button>

                    <button
                        onClick={() =>
                            navigate("/intern/reports")
                        }
                    >
                        My Reports
                    </button>
                </section>

                {/* Latest Evaluation */}

                <section>
                    <h2>Latest Evaluation</h2>

                    {latestEvaluation ? (
                        <div>

                            <p>
                                <strong>Period:</strong>{" "}
                                {latestEvaluation.periodType || "N/A"}
                            </p>

                            <p>
                                <strong>Score:</strong>{" "}
                                {latestEvaluation.finalScore ??
                                    latestEvaluation.evaluationScore ??
                                    "N/A"}
                            </p>

                            <p>
                                <strong>Communication:</strong>{" "}
                                {latestEvaluation.communication ?? "N/A"}
                            </p>

                            <p>
                                <strong>Technical Skill:</strong>{" "}
                                {latestEvaluation.technicalSkill ?? "N/A"}
                            </p>

                            <p>
                                <strong>Punctuality:</strong>{" "}
                                {latestEvaluation.punctuality ?? "N/A"}
                            </p>

                            <p>
                                <strong>Task Completion:</strong>{" "}
                                {latestEvaluation.taskCompletion ?? "N/A"}
                            </p>

                            <p>
                                <strong>Teamwork:</strong>{" "}
                                {latestEvaluation.teamwork ?? "N/A"}
                            </p>

                        </div>
                    ) : (
                        <p>
                            No evaluation available yet.
                        </p>
                    )}
                </section>

                {/* Recent Tasks */}

                <section>
                    <h2>Recent Tasks</h2>

                    {tasks.length === 0 ? (
                        <p>
                            No tasks assigned or created yet.
                        </p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Source</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                    <th>Hours</th>
                                </tr>
                            </thead>

                            <tbody>
                                {tasks.slice(0, 5).map((task) => (
                                    <tr key={task._id}>

                                        <td>
                                            {task.title}
                                        </td>

                                        <td>
                                            {task.isBroadcast
                                                ? "Mentor Assigned"
                                                : "My Task"}
                                        </td>

                                        <td>
                                            {formatDate(task.dueDate)}
                                        </td>

                                        <td>
                                            {task.status}
                                        </td>

                                        <td>
                                            {task.progress ?? 0}%
                                        </td>

                                        <td>
                                            {task.hoursSpent ?? 0}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {tasks.length > 5 && (
                        <button
                            onClick={() =>
                                navigate("/intern/tasks")
                            }
                        >
                            View All Tasks
                        </button>
                    )}
                </section>

                {/* Recent Daily Updates */}

                <section>
                    <h2>Recent Daily Updates</h2>

                    {updates.length === 0 ? (
                        <p>
                            No daily updates submitted yet.
                        </p>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Work Done</th>
                                    <th>Hours</th>
                                </tr>
                            </thead>

                            <tbody>
                                {updates.slice(0, 5).map((update) => (
                                    <tr key={update._id}>

                                        <td>
                                            {formatDate(update.date)}
                                        </td>

                                        <td>
                                            {update.workDescription}
                                        </td>

                                        <td>
                                            {update.hoursWorked ?? 0}
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {updates.length > 5 && (
                        <button
                            onClick={() =>
                                navigate("/intern/daily-updates")
                            }
                        >
                            View All Updates
                        </button>
                    )}
                </section>

                {/* Latest Report */}

                <section>
                    <h2>Reports</h2>

                    {reports.length === 0 ? (
                        <p>
                            No reports available yet.
                        </p>
                    ) : (
                        <div>

                            <p>
                                <strong>Total Reports:</strong>{" "}
                                {reports.length}
                            </p>

                            {latestReport && (
                                <>
                                    <p>
                                        <strong>Latest Report:</strong>{" "}
                                        {latestReport.periodType}
                                    </p>

                                    <p>
                                        <strong>Period:</strong>{" "}
                                        {formatDate(latestReport.periodStart)}
                                        {" - "}
                                        {formatDate(latestReport.periodEnd)}
                                    </p>

                                    <p>
                                        <strong>Actual Hours:</strong>{" "}
                                        {latestReport.totalActualHours ?? 0}
                                    </p>

                                    <p>
                                        <strong>Overtime:</strong>{" "}
                                        {latestReport.overtimeHours ?? 0}
                                    </p>

                                    <p>
                                        <strong>Evaluation:</strong>{" "}
                                        {latestReport.evaluationScore ?? "N/A"}
                                    </p>
                                </>
                            )}

                            <button
                                onClick={() =>
                                    navigate("/intern/reports")
                                }
                            >
                                View Reports
                            </button>

                        </div>
                    )}
                </section>

            </main>

        </div>
    );
};

export default InternDashboard;