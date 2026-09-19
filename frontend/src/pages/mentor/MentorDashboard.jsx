// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import api from "../../services/api.js";
// import { useAuth } from "../../context/AuthContext.jsx";
// import BackButton from "../../components/BackButton.jsx";

// const MentorDashboard = () => {
//     const navigate = useNavigate();
//     const { user, logout } = useAuth();

//     const [internships, setInternships] = useState([]);
//     const [tasks, setTasks] = useState([]);
//     const [updates, setUpdates] = useState([]);
//     const [evaluations, setEvaluations] = useState([]);
//     const [reports, setReports] = useState([]);

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     const fetchDashboardData = async () => {
//         try {
//             setLoading(true);
//             setError("");

//             const [
//                 internshipsResponse,
//                 tasksResponse,
//                 updatesResponse,
//                 evaluationsResponse,
//                 reportsResponse
//             ] = await Promise.all([
//                 api.get("/api/internships/my"),
//                 api.get("/api/tasks"),
//                 api.get("/api/daily-updates"),
//                 api.get("/api/evaluations"),
//                 api.get("/api/reports")
//             ]);

//             setInternships(
//                 internshipsResponse.data.internships || []
//             );

//             setTasks(
//                 tasksResponse.data.tasks || []
//             );

//             setUpdates(
//                 updatesResponse.data.dailyUpdates || []
//             );

//             setEvaluations(
//                 evaluationsResponse.data.evaluations || []
//             );

//             setReports(
//                 reportsResponse.data.reports || []
//             );

//         } catch (error) {
//             console.error(error);

//             setError(
//                 error.response?.data?.message ||
//                 "Failed to load mentor dashboard"
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchDashboardData();
//     }, []);

//     const handleLogout = () => {
//         logout();
//         navigate("/login");
//     };

//     const uniqueInterns = [
//         ...new Map(
//             [
//                 ...tasks.map((task) => task.assignedTo),
//                 ...updates.map((update) => update.intern)
//             ]
//                 .filter(Boolean)
//                 .map((intern) => [intern._id, intern])
//         ).values()
//     ];

//     const completedTasks = tasks.filter(
//         (task) => task.status === "COMPLETED"
//     ).length;

//     const pendingTasks = tasks.filter(
//         (task) => task.status === "PENDING"
//     ).length;

//     if (loading) {
//         return <p>Loading mentor dashboard...</p>;
//     }

//     return (
//         <div>

//             <BackButton fallback="/mentor/dashboard" />

//             <header>
//                 <h1>InternTracker</h1>

//                 <div>
//                     <span>
//                         Welcome, {user?.name}
//                     </span>

//                     <button onClick={handleLogout}>
//                         Logout
//                     </button>
//                 </div>
//             </header>

//             <main>

//                 <h2>Mentor Dashboard</h2>

//                 {error && <p>{error}</p>}

//                 {/* Summary Cards */}

//                 <section>

//                     <div>
//                         <h3>Assigned Interns</h3>
//                         <p>{uniqueInterns.length}</p>
//                     </div>

//                     <div>
//                         <h3>Internships</h3>
//                         <p>{internships.length}</p>
//                     </div>

//                     <div>
//                         <h3>Total Tasks</h3>
//                         <p>{tasks.length}</p>
//                     </div>

//                     <div>
//                         <h3>Completed Tasks</h3>
//                         <p>{completedTasks}</p>
//                     </div>

//                     <div>
//                         <h3>Pending Tasks</h3>
//                         <p>{pendingTasks}</p>
//                     </div>

//                     <div>
//                         <h3>Evaluations</h3>
//                         <p>{evaluations.length}</p>
//                     </div>

//                 </section>

//                 {/* Actions */}

//                 <section>

//                     <h2>Mentor Actions</h2>

//                     <button
//                         onClick={() =>
//                             navigate("/mentor/tasks")
//                         }
//                     >
//                         Manage Tasks
//                     </button>

//                     <button
//                         onClick={() =>
//                             navigate("/mentor/evaluations")
//                         }
//                     >
//                         Manage Evaluations
//                     </button>

//                     <button
//                         onClick={() =>
//                             navigate("/mentor/reports")
//                         }
//                     >
//                         View Reports
//                     </button>

//                 </section>

//                 {/* Assigned Internships */}

//                 <section>

//                     <h2>My Internships</h2>

//                     {internships.length === 0 ? (
//                         <p>
//                             No internships assigned.
//                         </p>
//                     ) : (
//                         <table>

//                             <thead>
//                                 <tr>
//                                     <th>Internship</th>
//                                     <th>Company</th>
//                                     <th>Intern</th>
//                                     <th>Start Date</th>
//                                     <th>Status</th>
//                                 </tr>
//                             </thead>

//                             <tbody>

//                                 {internships.map((internship) => (
//                                     <tr key={internship._id}>

//                                         <td>
//                                             {internship.title}
//                                         </td>

//                                         <td>
//                                             {internship.company?.name ||
//                                                 "N/A"}
//                                         </td>

//                                         <td>
//                                             {internship.intern?.name ||
//                                                 "N/A"}
//                                         </td>

//                                         <td>
//                                             {internship.startDate
//                                                 ? internship.startDate.substring(
//                                                     0,
//                                                     10
//                                                 )
//                                                 : "N/A"}
//                                         </td>

//                                         <td>
//                                             {internship.status}
//                                         </td>

//                                     </tr>
//                                 ))}

//                             </tbody>

//                         </table>
//                     )}

//                 </section>

//                 {/* Recent Tasks */}

//                 <section>

//                     <h2>Recent Tasks</h2>

//                     {tasks.length === 0 ? (
//                         <p>No tasks assigned yet.</p>
//                     ) : (
//                         <table>

//                             <thead>
//                                 <tr>
//                                     <th>Task</th>
//                                     <th>Intern</th>
//                                     <th>Status</th>
//                                     <th>Progress</th>
//                                 </tr>
//                             </thead>

//                             <tbody>

//                                 {tasks.slice(0, 5).map((task) => (
//                                     <tr key={task._id}>

//                                         <td>
//                                             {task.title}
//                                         </td>

//                                         <td>
//                                             {task.assignedTo?.name ||
//                                                 "N/A"}
//                                         </td>

//                                         <td>
//                                             {task.status}
//                                         </td>

//                                         <td>
//                                             {task.progress}%
//                                         </td>

//                                     </tr>
//                                 ))}

//                             </tbody>

//                         </table>
//                     )}

//                 </section>

//                 {/* Reports */}

//                 <section>

//                     <h2>Reports</h2>

//                     <p>
//                         Total generated reports:
//                         {" "}
//                         {reports.length}
//                     </p>

//                 </section>

//             </main>

//         </div>
//     );
// };

// export default MentorDashboard;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";

const MentorDashboard = () => {
    const navigate = useNavigate();

    const [internships, setInternships] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [evaluations, setEvaluations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                internshipsResponse,
                tasksResponse,
                evaluationsResponse
            ] = await Promise.all([
                api.get("/api/internships"),
                api.get("/api/tasks"),
                api.get("/api/evaluations")
            ]);

            setInternships(
                internshipsResponse.data.internships || []
            );

            setTasks(
                tasksResponse.data.tasks || []
            );

            setEvaluations(
                evaluationsResponse.data.evaluations || []
            );

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
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

    if (loading) {
        return (
            <div>
                <BackButton fallback="/mentor/dashboard" />
                <p>Loading mentor dashboard...</p>
            </div>
        );
    }

    return (
        <div>

            <BackButton fallback="/mentor/dashboard" />

            <h1>Mentor Dashboard</h1>

            <p>
                Manage assigned interns, tasks, evaluations,
                and internship progress.
            </p>

            {error && (
                <p>{error}</p>
            )}

            <hr />

            <section>
                <h2>Overview</h2>

                <div>
                    <div>
                        <h3>Internships</h3>
                        <p>{internships.length}</p>
                    </div>

                    <div>
                        <h3>Tasks</h3>
                        <p>{tasks.length}</p>
                    </div>

                    <div>
                        <h3>Completed Tasks</h3>
                        <p>{completedTasks}</p>
                    </div>

                    <div>
                        <h3>Pending Tasks</h3>
                        <p>{pendingTasks}</p>
                    </div>

                    <div>
                        <h3>In Progress</h3>
                        <p>{inProgressTasks}</p>
                    </div>

                    <div>
                        <h3>Delayed</h3>
                        <p>{delayedTasks}</p>
                    </div>

                    <div>
                        <h3>Evaluations</h3>
                        <p>{evaluations.length}</p>
                    </div>
                </div>
            </section>

            <hr />

            <section>
                <h2>Quick Actions</h2>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/mentor/interns")
                    }
                >
                    My Interns
                </button>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/mentor/tasks")
                    }
                >
                    Manage Tasks
                </button>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/mentor/evaluations")
                    }
                >
                    Evaluations
                </button>

                <button
                    type="button"
                    onClick={() =>
                        navigate("/mentor/reports")
                    }
                >
                    Reports
                </button>
            </section>

            <hr />

            <section>
                <h2>My Internships</h2>

                {internships.length === 0 ? (
                    <p>
                        No internships are assigned to you.
                    </p>
                ) : (
                    <table>

                        <thead>
                            <tr>
                                <th>Internship</th>
                                <th>Intern</th>
                                <th>Company</th>
                                <th>Status</th>
                                <th>Start Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {internships.map((internship) => (
                                <tr key={internship._id}>

                                    <td>
                                        {internship.title}
                                    </td>

                                    <td>
                                        {internship.intern?.fullName ||
                                            internship.intern?.name ||
                                            "N/A"}
                                    </td>

                                    <td>
                                        {internship.company?.name ||
                                            "N/A"}
                                    </td>

                                    <td>
                                        {internship.status}
                                    </td>

                                    <td>
                                        {internship.startDate
                                            ? internship.startDate.substring(
                                                0,
                                                10
                                            )
                                            : "N/A"}
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>
                )}
            </section>

            <hr />

            <section>
                <h2>Recent Assigned Tasks</h2>

                {tasks.length === 0 ? (
                    <p>
                        No tasks assigned yet.
                    </p>
                ) : (
                    <table>

                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Intern</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Progress</th>
                            </tr>
                        </thead>

                        <tbody>
                            {tasks
                                .slice(0, 5)
                                .map((task) => (
                                    <tr key={task._id}>

                                        <td>
                                            {task.title}
                                        </td>

                                        <td>
                                            {task.assignedTo?.fullName ||
                                                task.assignedTo?.name ||
                                                "N/A"}
                                        </td>

                                        <td>
                                            {task.dueDate
                                                ? task.dueDate.substring(
                                                    0,
                                                    10
                                                )
                                                : "N/A"}
                                        </td>

                                        <td>
                                            {task.status}
                                        </td>

                                        <td>
                                            {task.progress ?? 0}%
                                        </td>

                                    </tr>
                                ))}
                        </tbody>

                    </table>
                )}
            </section>

            <hr />

            <button
                type="button"
                onClick={handleLogout}
            >
                Logout
            </button>

        </div>
    );
};

export default MentorDashboard;