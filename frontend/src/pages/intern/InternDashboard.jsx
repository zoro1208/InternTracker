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

        if (normalizedStatus === "ACTIVE") {
            return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
        }

        if (normalizedStatus === "COMPLETED") {
            return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
        }

        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    };

    const summaryCards = [
        {
            title: "Total Tasks",
            value: tasks.length,
            description: "Assigned tasks",
            icon: "T"
        },
        {
            title: "Completed",
            value: completedTasks,
            description: "Completed tasks",
            icon: "✓"
        },
        {
            title: "In Progress",
            value: inProgressTasks,
            description: "Tasks in progress",
            icon: "IP"
        },
        {
            title: "Pending",
            value: pendingTasks,
            description: "Pending tasks",
            icon: "P"
        },
        {
            title: "Delayed",
            value: delayedTasks,
            description: "Delayed tasks",
            icon: "D"
        },
        {
            title: "Task Progress",
            value: `${averageProgress}%`,
            description: "Average progress",
            icon: "%"
        },
        {
            title: "Mentor Assigned",
            value: mentorAssignedTasks,
            description: "Mentor-assigned tasks",
            icon: "M"
        },
        {
            title: "Daily Updates",
            value: updates.length,
            description: "Submitted updates",
            icon: "U"
        }
    ];

    const quickActions = [
        {
            title: "My Tasks",
            description: "View and update your assigned tasks.",
            icon: "T",
            action: () => navigate("/intern/tasks")
        },
        {
            title: "Daily Updates",
            description: "Submit and manage today's work update.",
            icon: "U",
            action: () => navigate("/intern/daily-updates")
        },
        {
            title: "My Reports",
            description: "View internship performance reports.",
            icon: "R",
            action: () => navigate("/intern/reports")
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading dashboard...
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
                    <BackButton fallback="/login" />
                </div>

                {/* Header */}
                <header className="mb-8 rounded-2xl bg-slate-900 px-6 py-6 shadow-sm sm:px-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

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
                                <p className="text-sm font-medium text-blue-400">
                                    Welcome back
                                </p>

                                <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                                    {user?.name || "Intern"}
                                </h2>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                                    Track your internship, complete assigned
                                    tasks, submit daily updates, and monitor
                                    your performance.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 lg:min-w-[260px]">
                            <div className="min-w-0">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Intern
                                </p>

                                <p className="mt-1 truncate text-sm font-semibold text-white">
                                    {user?.name || "Intern"}
                                </p>

                                {user?.email && (
                                    <p className="mt-1 truncate text-xs text-slate-400">
                                        {user.email}
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                Logout
                            </button>
                        </div>

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

                {/* Internship Information */}
                <section className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                            My Internship
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Your current internship assignment.
                        </p>
                    </div>

                    {internship ? (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h4 className="text-2xl font-bold text-slate-900">
                                            {internship.title}
                                        </h4>

                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                                internship.status
                                            )}`}
                                        >
                                            {String(
                                                internship.status || "N/A"
                                            ).toUpperCase()}
                                        </span>
                                    </div>

                                    {internship.description && (
                                        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                                            {internship.description}
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-xl bg-slate-50 px-4 py-3 lg:min-w-[200px]">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Company
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {internship.company?.name || "N/A"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-3">

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Mentor
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {internship.mentor?.name || "N/A"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Start Date
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {formatDate(
                                            internship.startDate
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        End Date
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {internship.endDate
                                            ? formatDate(
                                                  internship.endDate
                                              )
                                            : "Ongoing"}
                                    </p>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
                            <h4 className="text-base font-semibold text-amber-900">
                                No internship assigned yet
                            </h4>

                            <p className="mt-1 text-sm text-amber-700">
                                Your internship information will appear here
                                once an assignment is created.
                            </p>
                        </div>
                    )}
                </section>

                {/* Overview */}
                <section className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                            Overview
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            A snapshot of your internship activity.
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
                            Access your main internship tools.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

                {/* Latest Evaluation */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <h3 className="text-xl font-bold text-slate-900">
                            Latest Evaluation
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Your most recent mentor evaluation.
                        </p>
                    </div>

                    {latestEvaluation ? (
                        <div className="p-5 sm:p-6">

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                                <div className="rounded-xl bg-slate-900 p-5">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Final Score
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-white">
                                        {latestEvaluation.finalScore ??
                                            latestEvaluation.evaluationScore ??
                                            "N/A"}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {latestEvaluation.periodType ||
                                            "Evaluation"}
                                    </p>
                                </div>

                                {[
                                    {
                                        label: "Communication",
                                        value:
                                            latestEvaluation.communication
                                    },
                                    {
                                        label: "Technical Skill",
                                        value:
                                            latestEvaluation.technicalSkill
                                    },
                                    {
                                        label: "Punctuality",
                                        value:
                                            latestEvaluation.punctuality
                                    },
                                    {
                                        label: "Task Completion",
                                        value:
                                            latestEvaluation.taskCompletion
                                    },
                                    {
                                        label: "Teamwork",
                                        value:
                                            latestEvaluation.teamwork
                                    }
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                                    >
                                        <p className="text-sm font-medium text-slate-500">
                                            {item.label}
                                        </p>

                                        <p className="mt-2 text-2xl font-bold text-slate-900">
                                            {item.value ?? "N/A"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="px-5 py-12 text-center sm:px-6">
                            <p className="text-sm text-slate-500">
                                No evaluation available yet.
                            </p>
                        </div>
                    )}
                </section>

                {/* Recent Tasks */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Recent Tasks
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Your latest assigned tasks and progress.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                {tasks.length}
                            </span>
                        </div>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="px-5 py-12 text-center sm:px-6">
                            <p className="text-sm text-slate-500">
                                No tasks assigned or created yet.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                Task
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                Source
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

                                            <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                Hours
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

                                                    <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                            {task.isBroadcast
                                                                ? "Mentor Assigned"
                                                                : "My Task"}
                                                        </span>
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
                                                            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
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

                                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700 sm:px-6">
                                                        {task.hoursSpent ??
                                                            0}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>

                            {tasks.length > 5 && (
                                <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate("/intern/tasks")
                                        }
                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    >
                                        View All Tasks
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* Recent Daily Updates */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Recent Daily Updates
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Your most recent work updates.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                {updates.length}
                            </span>
                        </div>
                    </div>

                    {updates.length === 0 ? (
                        <div className="px-5 py-12 text-center sm:px-6">
                            <p className="text-sm text-slate-500">
                                No daily updates submitted yet.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="bg-slate-50">
                                        <tr>
                                            <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                Date
                                            </th>

                                            <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                Work Done
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                Hours
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {updates
                                            .slice(0, 5)
                                            .map((update) => (
                                                <tr
                                                    key={update._id}
                                                    className="transition hover:bg-slate-50"
                                                >
                                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900 sm:px-6">
                                                        {formatDate(
                                                            update.date
                                                        )}
                                                    </td>

                                                    <td className="min-w-[280px] max-w-xl px-5 py-4 text-sm leading-6 text-slate-600 sm:px-6">
                                                        {update.workDescription ||
                                                            "N/A"}
                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700 sm:px-6">
                                                        {update.hoursWorked ??
                                                            0}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>

                            {updates.length > 5 && (
                                <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                "/intern/daily-updates"
                                            )
                                        }
                                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    >
                                        View All Updates
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* Latest Report */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <h3 className="text-xl font-bold text-slate-900">
                            Reports
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Summary of your latest internship report.
                        </p>
                    </div>

                    {reports.length === 0 ? (
                        <div className="px-5 py-12 text-center sm:px-6">
                            <p className="text-sm text-slate-500">
                                No reports available yet.
                            </p>
                        </div>
                    ) : (
                        <div className="p-5 sm:p-6">

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Total Reports
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-slate-900">
                                        {reports.length}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Latest Report
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-slate-900">
                                        {latestReport?.periodType ||
                                            "N/A"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Actual Hours
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-slate-900">
                                        {latestReport?.totalActualHours ??
                                            0}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                        Evaluation
                                    </p>

                                    <p className="mt-2 text-2xl font-bold text-slate-900">
                                        {latestReport?.evaluationScore ??
                                            "N/A"}
                                    </p>
                                </div>

                            </div>

                            {latestReport && (
                                <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-5">
                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                                Latest Report Period
                                            </p>

                                            <p className="mt-1 text-sm font-semibold text-blue-900">
                                                {formatDate(
                                                    latestReport.periodStart
                                                )}
                                                {" → "}
                                                {formatDate(
                                                    latestReport.periodEnd
                                                )}
                                            </p>

                                            <p className="mt-2 text-sm text-blue-800">
                                                Overtime:{" "}
                                                {latestReport.overtimeHours ??
                                                    0}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    "/intern/reports"
                                                )
                                            }
                                            className="w-fit rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
                                        >
                                            View Reports
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </section>

                <footer className="py-8 text-center">
                    <p className="text-xs text-slate-400">
                        InternTracker · Intern Panel
                    </p>
                </footer>

            </div>
        </div>
    );
};

export default InternDashboard;