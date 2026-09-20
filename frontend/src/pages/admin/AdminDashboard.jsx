import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import BackButton from "../../components/BackButton.jsx";

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [internships, setInternships] = useState([]);
    const [reports, setReports] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                companiesResponse,
                usersResponse,
                internshipsResponse,
                reportsResponse
            ] = await Promise.all([
                api.get("/api/companies"),
                api.get("/api/users"),
                api.get("/api/internships"),
                api.get("/api/reports")
            ]);

            setCompanies(
                companiesResponse.data?.companies || []
            );

            setUsers(
                usersResponse.data?.users || []
            );

            setInternships(
                internshipsResponse.data?.internships || []
            );

            setReports(
                reportsResponse.data?.reports || []
            );
        } catch (error) {
            console.error(
                "Admin dashboard error:",
                error
            );

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

    const totalMentors = users.filter(
        (currentUser) =>
            String(currentUser.role || "")
                .trim()
                .toUpperCase() === "MENTOR"
    ).length;

    const totalInterns = users.filter(
        (currentUser) =>
            String(currentUser.role || "")
                .trim()
                .toUpperCase() === "INTERN"
    ).length;

    const totalHRs = users.filter(
        (currentUser) =>
            String(currentUser.role || "")
                .trim()
                .toUpperCase() === "HR"
    ).length;

    const activeInternships = internships.filter(
        (internship) =>
            String(internship.status || "")
                .trim()
                .toUpperCase() === "ACTIVE"
    ).length;

    const completedInternships = internships.filter(
        (internship) =>
            String(internship.status || "")
                .trim()
                .toUpperCase() === "COMPLETED"
    ).length;

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString();
    };

    const getUserName = (person) => {
        if (!person) {
            return "N/A";
        }

        return (
            person.name ||
            person.fullName ||
            person.email ||
            "N/A"
        );
    };

    const getCompanyName = (company) => {
        if (!company) {
            return "N/A";
        }

        return company.name || "N/A";
    };

    const getStatusClasses = (status) => {
        const normalizedStatus = String(status || "")
            .trim()
            .toUpperCase();

        if (normalizedStatus === "ACTIVE") {
            return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
        }

        if (normalizedStatus === "COMPLETED") {
            return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
        }

        if (normalizedStatus === "UPCOMING") {
            return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
        }

        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    };

    const managementItems = [
        {
            title: "Manage Companies",
            description: "Add, view and manage internship companies.",
            icon: "C",
            action: () => navigate("/admin/companies")
        },
        {
            title: "Manage Users",
            description: "Manage mentors, interns and system users.",
            icon: "U",
            action: () => navigate("/admin/users")
        },
        {
            title: "Manage Internships",
            description: "Create and manage internship assignments.",
            icon: "I",
            action: () => navigate("/admin/internships")
        },
        {
            title: "View Reports",
            description: "Review internship reports and performance data.",
            icon: "R",
            action: () => navigate("/admin/reports")
        }
    ];

    const statCards = [
        {
            title: "Companies",
            value: companies.length,
            description: "Registered companies",
            icon: "C"
        },
        {
            title: "Total Users",
            value: users.length,
            description: "All system users",
            icon: "U"
        },
        {
            title: "HR",
            value: totalHRs,
            description: "HR accounts",
            icon: "H"
        },
        {
            title: "Mentors",
            value: totalMentors,
            description: "Active mentors",
            icon: "M"
        },
        {
            title: "Interns",
            value: totalInterns,
            description: "Registered interns",
            icon: "I"
        },
        {
            title: "Internships",
            value: internships.length,
            description: "Total internships",
            icon: "IN"
        },
        {
            title: "Active",
            value: activeInternships,
            description: "Currently active",
            icon: "A"
        },
        {
            title: "Completed",
            value: completedInternships,
            description: "Completed internships",
            icon: "✓"
        },
        {
            title: "Reports",
            value: reports.length,
            description: "Generated reports",
            icon: "R"
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading admin dashboard...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

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
                                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                                    Admin Dashboard
                                </h2>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                                    Manage companies, users, internships,
                                    assignments, and reports from one place.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 lg:min-w-[260px]">
                            <div className="min-w-0">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Signed in as
                                </p>

                                <p className="mt-1 truncate text-sm font-semibold text-white">
                                    {user?.name ||
                                        user?.fullName ||
                                        user?.email ||
                                        "Admin"}
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

                {/* Overview */}
                <section className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                            System Overview
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            A snapshot of the current InternTracker system.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {statCards.map((card) => (
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

                {/* Management */}
                <section className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                            Management
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Quickly access the main administrative modules.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {managementItems.map((item) => (
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

                                    <div className="min-w-0">
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

                {/* Recent Internships */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <h3 className="text-xl font-bold text-slate-900">
                            Recent Internships
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            The latest internship assignments in the system.
                        </p>
                    </div>

                    {internships.length === 0 ? (
                        <div className="px-5 py-10 text-center sm:px-6">
                            <p className="text-sm text-slate-500">
                                No internships found.
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
                                            Company
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Intern
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Mentor
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Start Date
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {internships
                                        .slice(0, 5)
                                        .map((internship) => (
                                            <tr
                                                key={internship._id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                    <p className="text-sm font-semibold text-slate-900">
                                                        {internship.title ||
                                                            "N/A"}
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {getCompanyName(
                                                        internship.company
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {getUserName(
                                                        internship.intern
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {getUserName(
                                                        internship.mentor
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {formatDate(
                                                        internship.startDate
                                                    )}
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
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Recent Reports */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <h3 className="text-xl font-bold text-slate-900">
                            Recent Reports
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Recently generated internship reports.
                        </p>
                    </div>

                    {reports.length === 0 ? (
                        <div className="px-5 py-10 text-center sm:px-6">
                            <p className="text-sm text-slate-500">
                                No reports generated yet.
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
                                            Type
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Period
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Evaluation
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {reports
                                        .slice(0, 5)
                                        .map((report) => (
                                            <tr
                                                key={report._id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900 sm:px-6">
                                                    {report.internship
                                                        ?.title || "N/A"}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {getUserName(
                                                        report.intern
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                        {report.periodType ||
                                                            "N/A"}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {formatDate(
                                                        report.periodStart
                                                    )}
                                                    <span className="mx-1 text-slate-300">
                                                        →
                                                    </span>
                                                    {formatDate(
                                                        report.periodEnd
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900 sm:px-6">
                                                    {report.evaluationScore ??
                                                        "N/A"}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Footer */}
                <footer className="py-8 text-center">
                    <p className="text-xs text-slate-400">
                        InternTracker · Admin Panel
                    </p>
                </footer>

            </div>
        </div>
    );
};

export default AdminDashboard;