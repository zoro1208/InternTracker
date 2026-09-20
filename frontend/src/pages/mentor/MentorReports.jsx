import { useEffect, useState } from "react";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";

const getToday = () => {
    return new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata"
    });
};

const getWeekStart = () => {
    const today = new Date(
        `${getToday()}T00:00:00+05:30`
    );

    const day = today.getDay();

    // Monday = 1, Sunday = 0
    const difference = day === 0 ? -6 : 1 - day;

    today.setDate(
        today.getDate() + difference
    );

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const date = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${date}`;
};

const getMonthStart = () => {
    const today = getToday();

    return `${today.substring(0, 7)}-01`;
};

const MentorReports = () => {
    const [internships, setInternships] = useState([]);
    const [reports, setReports] = useState([]);

    const [formData, setFormData] = useState({
        internship: "",
        periodType: "WEEKLY"
    });

    const [selectedReport, setSelectedReport] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                internshipsResponse,
                reportsResponse
            ] = await Promise.all([
                api.get("/api/internships/my"),
                api.get("/api/reports")
            ]);

            const myInternships =
                internshipsResponse.data.internships || [];

            setInternships(myInternships);

            setReports(
                reportsResponse.data.reports || []
            );

            if (
                myInternships.length > 0 &&
                !formData.internship
            ) {
                setFormData((previous) => ({
                    ...previous,
                    internship: myInternships[0]._id
                }));
            }
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
        fetchData();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const getPeriod = () => {
        if (formData.periodType === "MONTHLY") {
            return `${getMonthStart()} to ${getToday()}`;
        }

        return `${getWeekStart()} to ${getToday()}`;
    };

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!formData.internship) {
            setError("Please select an internship.");
            return;
        }

        try {
            setGenerating(true);
            setError("");
            setMessage("");
            setSelectedReport(null);

            const response = await api.post(
                "/api/reports/generate",
                {
                    internship: formData.internship,
                    periodType: formData.periodType
                }
            );

            setSelectedReport(
                response.data.report
            );

            setMessage(
                "Report generated successfully."
            );

            await fetchData();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to generate report"
            );
        } finally {
            setGenerating(false);
        }
    };

    const handleViewReport = async (id) => {
        try {
            setError("");
            setMessage("");

            const response = await api.get(
                `/api/reports/${id}`
            );

            setSelectedReport(
                response.data.report
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load report"
            );
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString(
            "en-IN"
        );
    };

    const getStatusClasses = (status) => {
        const normalizedStatus = String(status || "")
            .trim()
            .toUpperCase();

        if (
            normalizedStatus === "COMPLETED" ||
            normalizedStatus === "SUBMITTED"
        ) {
            return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
        }

        if (
            normalizedStatus === "IN_PROGRESS" ||
            normalizedStatus === "WEEKDAY"
        ) {
            return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
        }

        if (
            normalizedStatus === "PENDING" ||
            normalizedStatus === "MISSING"
        ) {
            return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
        }

        if (
            normalizedStatus === "DELAYED" ||
            normalizedStatus === "NO_WORK"
        ) {
            return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";
        }

        if (normalizedStatus === "WEEKEND_WORK") {
            return "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200";
        }

        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    };

    const getPeriodTypeClasses = (periodType) => {
        const normalizedType = String(periodType || "")
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

    const inputClass =
        "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

    const summaryCards = selectedReport
        ? [
              {
                  title: "Working Days",
                  value: selectedReport.totalWorkingDays ?? 0,
                  description: "Expected working days",
                  icon: "W"
              },
              {
                  title: "Actual Hours",
                  value: selectedReport.totalActualHours ?? 0,
                  description: "Hours recorded",
                  icon: "H"
              },
              {
                  title: "Overtime",
                  value: selectedReport.overtimeHours ?? 0,
                  description: "Overtime hours",
                  icon: "O"
              },
              {
                  title: "Task Progress",
                  value: `${selectedReport.averageTaskProgress ?? 0}%`,
                  description: "Average task progress",
                  icon: "P"
              },
              {
                  title: "Evaluation",
                  value:
                      selectedReport.evaluationScore ??
                      "N/A",
                  description: "Final evaluation score",
                  icon: "E"
              }
          ]
        : [];

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
                            Mentor Reports
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Generate and view internship performance
                            reports for your interns.
                        </p>
                    </div>
                </header>

                {/* Messages */}
                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm font-medium text-red-700">
                            {error}
                        </p>
                    </div>
                )}

                {message && (
                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="text-sm font-medium text-emerald-700">
                            {message}
                        </p>
                    </div>
                )}

                {/* Generate Report */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <h3 className="text-xl font-bold text-slate-900">
                            Generate Report
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Generate a weekly or monthly performance report
                            for one of your internships.
                        </p>
                    </div>

                    {internships.length === 0 ? (
                        <div className="px-5 py-12 text-center sm:px-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                                R
                            </div>

                            <h4 className="mt-4 text-base font-semibold text-slate-900">
                                No internships assigned
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                You need an assigned internship before
                                generating a report.
                            </p>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleGenerate}
                            className="space-y-6 px-5 py-6 sm:px-6"
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                                {/* Internship */}
                                <div>
                                    <label
                                        htmlFor="report-internship"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Internship
                                    </label>

                                    <select
                                        id="report-internship"
                                        name="internship"
                                        value={formData.internship}
                                        onChange={handleChange}
                                        required
                                        disabled={generating}
                                        className={inputClass}
                                    >
                                        <option value="">
                                            Select Internship
                                        </option>

                                        {internships.map(
                                            (internship) => (
                                                <option
                                                    key={internship._id}
                                                    value={internship._id}
                                                >
                                                    {internship.title}
                                                    {" - "}
                                                    {internship.intern?.name ||
                                                        internship.intern?.fullName ||
                                                        "Intern"}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* Report Type */}
                                <div>
                                    <label
                                        htmlFor="report-period-type"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Report Type
                                    </label>

                                    <select
                                        id="report-period-type"
                                        name="periodType"
                                        value={formData.periodType}
                                        onChange={handleChange}
                                        disabled={generating}
                                        className={inputClass}
                                    >
                                        <option value="WEEKLY">
                                            Weekly
                                        </option>

                                        <option value="MONTHLY">
                                            Monthly
                                        </option>
                                    </select>
                                </div>

                            </div>

                            {/* Period */}
                            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                    Report Period
                                </p>

                                <p className="mt-1 text-sm font-semibold text-blue-900">
                                    {getPeriod()}
                                </p>
                            </div>

                            <div className="border-t border-slate-100 pt-5">
                                <button
                                    type="submit"
                                    disabled={generating}
                                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {generating
                                        ? "Generating..."
                                        : "Generate Report"}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {/* Selected Report */}
                {selectedReport && (
                    <section className="mb-8">

                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        {selectedReport.periodType} Report
                                    </h3>

                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPeriodTypeClasses(
                                            selectedReport.periodType
                                        )}`}
                                    >
                                        {String(
                                            selectedReport.periodType ||
                                                "N/A"
                                        ).toUpperCase()}
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-slate-500">
                                    Period:{" "}
                                    {formatDate(
                                        selectedReport.periodStart
                                    )}
                                    {" → "}
                                    {formatDate(
                                        selectedReport.periodEnd
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Report Summary */}
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            {summaryCards.map((card) => (
                                <div
                                    key={card.title}
                                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500">
                                                {card.title}
                                            </p>

                                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                                {card.value}
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                {card.description}
                                            </p>
                                        </div>

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
                                            {card.icon}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Attendance & Hours */}
                        <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                                <h4 className="text-lg font-bold text-slate-900">
                                    Attendance & Hours
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                                <div className="space-y-0">
                                    <div className="flex justify-between gap-4 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            Total Working Days
                                        </span>

                                        <span className="text-sm font-semibold text-slate-900">
                                            {selectedReport.totalWorkingDays ??
                                                0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            Updates Submitted
                                        </span>

                                        <span className="text-sm font-semibold text-slate-900">
                                            {selectedReport.submittedUpdateDays ??
                                                0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            Missing Updates
                                        </span>

                                        <span className="text-sm font-semibold text-slate-900">
                                            {selectedReport.missingUpdateDays ??
                                                0}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between gap-4 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            Expected Hours
                                        </span>

                                        <span className="text-sm font-semibold text-slate-900">
                                            {selectedReport.totalExpectedHours ??
                                                0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            Actual Hours
                                        </span>

                                        <span className="text-sm font-semibold text-slate-900">
                                            {selectedReport.totalActualHours ??
                                                0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            Overtime Hours
                                        </span>

                                        <span className="text-sm font-semibold text-purple-700">
                                            {selectedReport.overtimeHours ??
                                                0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            Weekend Hours
                                        </span>

                                        <span className="text-sm font-semibold text-slate-900">
                                            {selectedReport.weekendHours ??
                                                0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tasks */}
                        <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                                <h4 className="text-lg font-bold text-slate-900">
                                    Tasks
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                                <div>
                                    <div className="flex justify-between gap-4 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            Total Tasks
                                        </span>

                                        <span className="text-sm font-semibold text-slate-900">
                                            {selectedReport.totalTasks ?? 0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            Completed
                                        </span>

                                        <span className="text-sm font-semibold text-emerald-700">
                                            {selectedReport.completedTasks ??
                                                0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            In Progress
                                        </span>

                                        <span className="text-sm font-semibold text-blue-700">
                                            {selectedReport.inProgressTasks ??
                                                0}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between gap-4 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            Pending
                                        </span>

                                        <span className="text-sm font-semibold text-amber-700">
                                            {selectedReport.pendingTasks ??
                                                0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            Delayed
                                        </span>

                                        <span className="text-sm font-semibold text-red-700">
                                            {selectedReport.delayedTasks ??
                                                0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4 border-t border-slate-100 px-5 py-4 sm:px-6">
                                        <span className="text-sm text-slate-500">
                                            Average Task Progress
                                        </span>

                                        <span className="text-sm font-semibold text-slate-900">
                                            {selectedReport.averageTaskProgress ??
                                                0}
                                            %
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Evaluation */}
                        <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                                <h4 className="text-lg font-bold text-slate-900">
                                    Evaluation
                                </h4>
                            </div>

                            {selectedReport.evaluationScore !== null &&
                            selectedReport.evaluationScore !==
                                undefined ? (
                                <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">

                                    <div className="rounded-xl bg-slate-900 p-5">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Final Score
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-white">
                                            {
                                                selectedReport.evaluationScore
                                            }
                                        </p>
                                    </div>

                                    {[
                                        {
                                            label: "Communication",
                                            value:
                                                selectedReport.communication
                                        },
                                        {
                                            label: "Technical Skill",
                                            value:
                                                selectedReport.technicalSkill
                                        },
                                        {
                                            label: "Punctuality",
                                            value:
                                                selectedReport.punctuality
                                        },
                                        {
                                            label: "Task Completion",
                                            value:
                                                selectedReport.taskCompletion
                                        },
                                        {
                                            label: "Teamwork",
                                            value:
                                                selectedReport.teamwork
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
                            ) : (
                                <div className="px-5 py-10 text-center sm:px-6">
                                    <p className="text-sm text-slate-500">
                                        No evaluation available for this
                                        period.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Daily Breakdown */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                                <h4 className="text-lg font-bold text-slate-900">
                                    Daily Breakdown
                                </h4>

                                <p className="mt-1 text-sm text-slate-500">
                                    Daily activity, hours, and overtime for
                                    the selected period.
                                </p>
                            </div>

                            {!selectedReport.dailyBreakdown ||
                            selectedReport.dailyBreakdown.length === 0 ? (
                                <div className="px-5 py-10 text-center sm:px-6">
                                    <p className="text-sm text-slate-500">
                                        No daily activity found.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                    Date
                                                </th>

                                                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                    Day
                                                </th>

                                                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                    Type
                                                </th>

                                                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                    Status
                                                </th>

                                                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                    Hours
                                                </th>

                                                <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                                    Overtime
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {selectedReport.dailyBreakdown.map(
                                                (day, index) => (
                                                    <tr
                                                        key={index}
                                                        className="transition hover:bg-slate-50"
                                                    >
                                                        <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-900 sm:px-6">
                                                            {day.date?.substring(
                                                                0,
                                                                10
                                                            ) || "N/A"}
                                                        </td>

                                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                            {day.day || "N/A"}
                                                        </td>

                                                        <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                                                    day.dayType
                                                                )}`}
                                                            >
                                                                {day.dayType ||
                                                                    "N/A"}
                                                            </span>
                                                        </td>

                                                        <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                            <span
                                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                                                    day.status
                                                                )}`}
                                                            >
                                                                {day.status ||
                                                                    "N/A"}
                                                            </span>
                                                        </td>

                                                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900 sm:px-6">
                                                            {day.hoursWorked ??
                                                                0}
                                                        </td>

                                                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900 sm:px-6">
                                                            {day.overtimeHours ??
                                                                0}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Previous Reports */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Previous Reports
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Previously generated internship reports.
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
                                Generated reports will appear here.
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
                                            Start
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            End
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Actual Hours
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Overtime
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Evaluation
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Action
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
                                                <p className="min-w-40 text-sm font-semibold text-slate-900">
                                                    {report.internship
                                                        ?.title ||
                                                        "N/A"}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {report.intern?.name ||
                                                    report.intern?.fullName ||
                                                    "N/A"}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPeriodTypeClasses(
                                                        report.periodType
                                                    )}`}
                                                >
                                                    {String(
                                                        report.periodType ||
                                                            "N/A"
                                                    ).toUpperCase()}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {formatDate(
                                                    report.periodStart
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {formatDate(
                                                    report.periodEnd
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900 sm:px-6">
                                                {report.totalActualHours ??
                                                    0}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-purple-700 sm:px-6">
                                                {report.overtimeHours ?? 0}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                <span className="font-semibold text-slate-900">
                                                    {report.evaluationScore ??
                                                        "N/A"}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleViewReport(
                                                                report._id
                                                            )
                                                        }
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                    >
                                                        View Report
                                                    </button>
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
                        InternTracker · Mentor Reports
                    </p>
                </footer>

            </div>
        </div>
    );
};

export default MentorReports;