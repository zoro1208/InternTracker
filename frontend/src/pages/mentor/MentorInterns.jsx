import { useEffect, useState } from "react";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";

const MentorInterns = () => {
    const [internships, setInternships] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchInternships = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/api/internships/my"
            );

            setInternships(
                response.data.internships || []
            );
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load assigned interns"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInternships();
    }, []);

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString("en-IN");
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading assigned interns...
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
                            My Interns
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            View the interns assigned to your internships.
                        </p>
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
                                    Assigned Internships
                                </p>

                                <p className="mt-2 text-4xl font-bold text-slate-900">
                                    {internships.length}
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Current internship assignments
                                </p>
                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-lg font-bold text-blue-600">
                                I
                            </div>
                        </div>
                    </div>
                </section>

                {/* Interns Table */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Assigned Interns
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Interns currently assigned to your
                                    internships.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                {internships.length}
                            </span>
                        </div>
                    </div>

                    {internships.length === 0 ? (
                        <div className="px-5 py-14 text-center sm:px-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                                I
                            </div>

                            <h4 className="mt-4 text-base font-semibold text-slate-900">
                                No interns assigned
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                Assigned interns will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Intern Name
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Email
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Internship
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Company
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Start Date
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            End Date
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {internships.map((internship) => (
                                        <tr
                                            key={internship._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {internship.intern?.name ||
                                                        internship.intern?.fullName ||
                                                        "N/A"}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {internship.intern?.email ||
                                                    "N/A"}
                                            </td>

                                            <td className="px-5 py-4 sm:px-6">
                                                <p className="min-w-40 text-sm font-semibold text-slate-900">
                                                    {internship.title}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {internship.company?.name ||
                                                    "N/A"}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {formatDate(
                                                    internship.startDate
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {formatDate(
                                                    internship.endDate
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

                <footer className="py-8 text-center">
                    <p className="text-xs text-slate-400">
                        InternTracker · My Interns
                    </p>
                </footer>

            </div>
        </div>
    );
};

export default MentorInterns;