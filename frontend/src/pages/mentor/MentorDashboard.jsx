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
                api.get("/api/internships/my"),
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

    const getStatusClasses = (status) => {
        const normalizedStatus = String(status || "")
            .trim()
            .toUpperCase();

        if (normalizedStatus === "COMPLETED") {
            return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
        }

        if (normalizedStatus === "IN_PROGRESS") {
            return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
        }

        if (normalizedStatus === "PENDING") {
            return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
        }

        if (normalizedStatus === "DELAYED") {
            return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
        }

        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    };

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString();
    };

    const summaryCards = [
        {
            title: "Internships",
            value: internships.length,
            description: "Assigned internships",
            icon: "I"
        },
        {
            title: "Tasks",
            value: tasks.length,
            description: "Total assigned tasks",
            icon: "T"
        },
        {
            title: "Completed",
            value: completedTasks,
            description: "Completed tasks",
            icon: "✓"
        },
        {
            title: "Pending",
            value: pendingTasks,
            description: "Pending tasks",
            icon: "P"
        },
        {
            title: "In Progress",
            value: inProgressTasks,
            description: "Tasks in progress",
            icon: "IP"
        },
        {
            title: "Delayed",
            value: delayedTasks,
            description: "Delayed tasks",
            icon: "D"
        },
        {
            title: "Evaluations",
            value: evaluations.length,
            description: "Recorded evaluations",
            icon: "E"
        }
    ];

    const quickActions = [
        {
            title: "My Interns",
            description: "View interns assigned to you.",
            icon: "I",
            action: () => navigate("/mentor/interns")
        },
        {
            title: "Manage Tasks",
            description: "Create and manage intern tasks.",
            icon: "T",
            action: () => navigate("/mentor/tasks")
        },
        {
            title: "Evaluations",
            description: "Review and manage evaluations.",
            icon: "E",
            action: () => navigate("/mentor/evaluations")
        },
        {
            title: "Reports",
            description: "View internship reports and progress.",
            icon: "R",
            action: () => navigate("/mentor/reports")
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading mentor dashboard...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

                {/* Back Button */}
                <div className="mb-4">
                    <BackButton fallback="/mentor/dashboard" />
                </div>

                {/* Header */}
                <header className="mb-8 rounded-2xl bg-slate-900 px-6 py-6 shadow-sm sm:px-8">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">
                                    IT
                                </div>

                                <div>
                                    <h1 className="text-xl font-bold text-white">
                                        InternTracker
                                    </h1>

                                    <p className="text-sm text-slate-400">
                                        Internship Management System
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                                    Mentor Dashboard
                                </h2>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                                    Manage assigned interns, tasks,
                                    evaluations, and internship progress.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-fit rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Error */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm font-medium text-red-700">
                            {error}
                        </p>
                    </div>
                )}

                {/* Overview */}
                <section className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                            Overview
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            A snapshot of your current internship activity.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {summaryCards.map((card) => (
                            <div
                                key={card.title}
                                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            {card.title}
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-slate-900">
                                            {card.value}
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {card.description}
                                        </p>
                                    </div>

                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                                        {card.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Quick Actions */}
                <section className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                            Quick Actions
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Quickly access your main mentor tools.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {quickActions.map((item) => (
                            <button
                                key={item.title}
                                type="button"
                                onClick={item.action}
                                className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                                        {item.icon}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <h4 className="text-base font-semibold text-slate-900">
                                                {item.title}
                                            </h4>

                                            <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500">
                                                →
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* My Internships */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    My Internships
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Internship assignments under your
                                    mentorship.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                {internships.length}
                            </span>
                        </div>
                    </div>

                    {internships.length === 0 ? (
                        <div className="px-5 py-12 text-center sm:px-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                                I
                            </div>

                            <h4 className="mt-4 text-base font-semibold text-slate-900">
                                No internships assigned
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                Internship assignments will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Internship
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Intern
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Company
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Status
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Start Date
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {internships.map((internship) => (
                                        <tr
                                            key={internship._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 sm:px-6">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {internship.title}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {internship.intern?.fullName ||
                                                    internship.intern?.name ||
                                                    "N/A"}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {internship.company?.name ||
                                                    "N/A"}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                                        internship.status
                                                    )}`}
                                                >
                                                    {String(
                                                        internship.status ||
                                                            "N/A"
                                                    ).toUpperCase()}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {formatDate(
                                                    internship.startDate
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Recent Assigned Tasks */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Recent Assigned Tasks
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Latest tasks assigned to interns.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                {tasks.length}
                            </span>
                        </div>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="px-5 py-12 text-center sm:px-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                                T
                            </div>

                            <h4 className="mt-4 text-base font-semibold text-slate-900">
                                No tasks assigned yet
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                Assigned tasks will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Task
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Intern
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Due Date
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Status
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Progress
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {tasks
                                        .slice(0, 5)
                                        .map((task) => (
                                            <tr
                                                key={task._id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4 sm:px-6">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {task.title}
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {task.assignedTo?.fullName ||
                                                        task.assignedTo?.name ||
                                                        "N/A"}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {formatDate(
                                                        task.dueDate
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                                            task.status
                                                        )}`}
                                                    >
                                                        {String(
                                                            task.status ||
                                                                "N/A"
                                                        ).toUpperCase()}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                                                            <div
                                                                className="h-full rounded-full bg-blue-600"
                                                                style={{
                                                                    width: `${Math.min(
                                                                        Math.max(
                                                                            Number(
                                                                                task.progress ??
                                                                                    0
                                                                            ),
                                                                            0
                                                                        ),
                                                                        100
                                                                    )}%`
                                                                }}
                                                            ></div>
                                                        </div>

                                                        <span className="text-sm font-semibold text-slate-700">
                                                            {task.progress ??
                                                                0}
                                                            %
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <footer className="py-8 text-center">
                    <p className="text-xs text-slate-400">
                        InternTracker · Mentor Panel
                    </p>
                </footer>

            </div>
        </div>
    );
};

export default MentorDashboard;