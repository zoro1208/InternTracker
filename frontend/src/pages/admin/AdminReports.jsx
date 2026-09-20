import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";

const AdminReports = () => {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReports = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/api/reports");

            setReports(response.data?.reports || []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load reports"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString();
    };

    const getInternshipName = (internship) => {
        if (!internship) {
            return "N/A";
        }

        if (typeof internship === "object") {
            return internship.title || "N/A";
        }

        return "N/A";
    };

    const getUserName = (user) => {
        if (!user) {
            return "N/A";
        }

        if (typeof user === "object") {
            return (
                user.name ||
                user.fullName ||
                user.email ||
                "N/A"
            );
        }

        return "N/A";
    };

    const getPeriodType = (report) => {
        return (
            report.periodType ||
            report.type ||
            "N/A"
        );
    };

    const getEvaluationScore = (report) => {
        return (
            report.evaluationScore ??
            report.finalScore ??
            report.evaluation?.finalScore ??
            "N/A"
        );
    };

    const getReportTypeClasses = (type) => {
        const normalizedType = String(type || "")
            .trim()
            .toUpperCase();

        if (normalizedType === "WEEKLY") {
            return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
        }

        if (normalizedType === "MONTHLY") {
            return "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200";
        }

        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading reports...
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
                    <BackButton fallback="/admin/dashboard" />
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
                                    Reports
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    View internship performance and
                                    evaluation reports.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/dashboard")
                            }
                            className="w-fit rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            Dashboard
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

                {/* Summary */}
                <section className="mb-8">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-500">
                                    Total Reports
                                </p>

                                <p className="mt-2 text-4xl font-bold text-slate-900">
                                    {reports.length}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Generated internship reports
                                </p>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-600">
                                R
                            </div>
                        </div>
                    </div>
                </section>

                {/* Reports List */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Generated Reports
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    All available internship performance
                                    reports.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                {reports.length}
                            </span>
                        </div>
                    </div>

                    {reports.length === 0 ? (
                        <div className="px-5 py-14 text-center sm:px-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                                R
                            </div>

                            <h4 className="mt-4 text-base font-semibold text-slate-900">
                                No reports generated yet
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                Generated internship reports will appear here.
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
                                            Report Type
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Period
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Evaluation
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Generated On
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {reports.map((report) => (
                                        <tr
                                            key={report._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 sm:px-6">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {getInternshipName(
                                                        report.internship
                                                    )}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {getUserName(
                                                    report.intern
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getReportTypeClasses(
                                                        getPeriodType(report)
                                                    )}`}
                                                >
                                                    {String(
                                                        getPeriodType(report)
                                                    ).toUpperCase()}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                <span>
                                                    {formatDate(
                                                        report.periodStart
                                                    )}
                                                </span>

                                                <span className="mx-1 text-slate-300">
                                                    →
                                                </span>

                                                <span>
                                                    {formatDate(
                                                        report.periodEnd
                                                    )}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                <span className="font-semibold text-slate-900">
                                                    {getEvaluationScore(
                                                        report
                                                    )}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {formatDate(
                                                    report.createdAt
                                                )}
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
                        InternTracker · Reports
                    </p>
                </footer>

            </div>
        </div>
    );
};

export default AdminReports;