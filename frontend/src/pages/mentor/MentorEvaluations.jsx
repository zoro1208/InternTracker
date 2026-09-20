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

const emptyForm = {
    internship: "",
    periodType: "WEEKLY",
    communication: "",
    technicalSkill: "",
    punctuality: "",
    taskCompletion: "",
    teamwork: ""
};

const MentorEvaluations = () => {
    const [internships, setInternships] = useState([]);
    const [evaluations, setEvaluations] = useState([]);

    const [formData, setFormData] = useState(emptyForm);

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                internshipsResponse,
                evaluationsResponse
            ] = await Promise.all([
                api.get("/api/internships/my"),
                api.get("/api/evaluations")
            ]);

            const myInternships =
                internshipsResponse.data.internships || [];

            setInternships(myInternships);

            setEvaluations(
                evaluationsResponse.data.evaluations || []
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
                "Failed to load evaluations"
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

    const validateScore = (value) => {
        const score = Number(value);

        return (
            value !== "" &&
            Number.isFinite(score) &&
            score >= 0 &&
            score <= 100
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        setError("");
        setMessage("");

        if (!formData.internship) {
            setError(
                "Please select an internship."
            );
            return;
        }

        const scoreFields = [
            "communication",
            "technicalSkill",
            "punctuality",
            "taskCompletion",
            "teamwork"
        ];

        const invalidScore = scoreFields.some(
            (field) => !validateScore(formData[field])
        );

        if (invalidScore) {
            setError(
                "All evaluation scores must be between 0 and 100."
            );
            return;
        }

        try {
            setIsSubmitting(true);

            await api.post(
                "/api/evaluations",
                {
                    internship: formData.internship,
                    periodType: formData.periodType,
                    communication:
                        Number(formData.communication),
                    technicalSkill:
                        Number(formData.technicalSkill),
                    punctuality:
                        Number(formData.punctuality),
                    taskCompletion:
                        Number(formData.taskCompletion),
                    teamwork:
                        Number(formData.teamwork)
                }
            );

            setMessage(
                "Evaluation submitted successfully."
            );

            setFormData({
                ...emptyForm,
                internship: formData.internship,
                periodType: formData.periodType
            });

            await fetchData();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to submit evaluation"
            );
        } finally {
            setIsSubmitting(false);
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

    const getPeriod = () => {
        if (formData.periodType === "MONTHLY") {
            return `${getMonthStart()} to ${getToday()}`;
        }

        return `${getWeekStart()} to ${getToday()}`;
    };

    const getScoreClass = (score) => {
        const value = Number(score);

        if (!Number.isFinite(value)) {
            return "text-slate-700";
        }

        if (value >= 80) {
            return "text-emerald-700";
        }

        if (value >= 60) {
            return "text-blue-700";
        }

        if (value >= 40) {
            return "text-amber-700";
        }

        return "text-red-700";
    };

    const scoreFields = [
        {
            name: "communication",
            label: "Communication"
        },
        {
            name: "technicalSkill",
            label: "Technical Skill"
        },
        {
            name: "punctuality",
            label: "Punctuality"
        },
        {
            name: "taskCompletion",
            label: "Task Completion"
        },
        {
            name: "teamwork",
            label: "Teamwork"
        }
    ];

    const inputClass =
        "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading evaluations...
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
                            Manage Evaluations
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Evaluate the interns assigned to your
                            internships.
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

                {/* Evaluation Form */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <h3 className="text-xl font-bold text-slate-900">
                            Submit Evaluation
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Record performance scores for an assigned
                            internship.
                        </p>
                    </div>

                    {internships.length === 0 ? (
                        <div className="px-5 py-12 text-center sm:px-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                                E
                            </div>

                            <h4 className="mt-4 text-base font-semibold text-slate-900">
                                No internships assigned
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                You need an assigned internship before
                                submitting an evaluation.
                            </p>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="px-5 py-6 sm:px-6"
                        >
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                                {/* Internship */}
                                <div>
                                    <label
                                        htmlFor="evaluation-internship"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Internship
                                    </label>

                                    <select
                                        id="evaluation-internship"
                                        name="internship"
                                        value={formData.internship}
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting}
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

                                {/* Evaluation Type */}
                                <div>
                                    <label
                                        htmlFor="evaluation-period-type"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Evaluation Type
                                    </label>

                                    <select
                                        id="evaluation-period-type"
                                        name="periodType"
                                        value={formData.periodType}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
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

                                {/* Evaluation Period */}
                                <div className="md:col-span-2">
                                    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                            Evaluation Period
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-blue-900">
                                            {formatDate(getPeriod().split(" to ")[0])}
                                            {" → "}
                                            {formatDate(getPeriod().split(" to ")[1])}
                                        </p>
                                    </div>
                                </div>

                                {/* Score Fields */}
                                {scoreFields.map((field) => (
                                    <div key={field.name}>
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <label
                                                htmlFor={`evaluation-${field.name}`}
                                                className="text-sm font-semibold text-slate-700"
                                            >
                                                {field.label}
                                            </label>

                                            <span className="text-xs font-medium text-slate-400">
                                                0–100
                                            </span>
                                        </div>

                                        <input
                                            id={`evaluation-${field.name}`}
                                            type="number"
                                            name={field.name}
                                            value={
                                                formData[field.name]
                                            }
                                            onChange={handleChange}
                                            min="0"
                                            max="100"
                                            required
                                            disabled={isSubmitting}
                                            placeholder="Enter score"
                                            className={inputClass}
                                        />
                                    </div>
                                ))}

                            </div>

                            {/* Submit */}
                            <div className="mt-6 border-t border-slate-100 pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting
                                        ? "Submitting..."
                                        : "Submit Evaluation"}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {/* Previous Evaluations */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Previous Evaluations
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Previously submitted intern
                                    evaluations.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                {evaluations.length}
                            </span>
                        </div>
                    </div>

                    {evaluations.length === 0 ? (
                        <div className="px-5 py-14 text-center sm:px-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                                E
                            </div>

                            <h4 className="mt-4 text-base font-semibold text-slate-900">
                                No evaluations submitted yet
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                Submitted evaluations will appear here.
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
                                            Communication
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Technical
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Punctuality
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Task Completion
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Teamwork
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Final Score
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {evaluations.map(
                                        (evaluation) => (
                                            <tr
                                                key={evaluation._id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4 sm:px-6">
                                                    <p className="min-w-40 text-sm font-semibold text-slate-900">
                                                        {evaluation.internship?.title ||
                                                            "N/A"}
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {evaluation.intern?.name ||
                                                        evaluation.intern?.fullName ||
                                                        "N/A"}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                                        {String(
                                                            evaluation.periodType ||
                                                                "N/A"
                                                        ).toUpperCase()}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {formatDate(
                                                        evaluation.periodStart
                                                    )}
                                                    <span className="mx-1 text-slate-300">
                                                        →
                                                    </span>
                                                    {formatDate(
                                                        evaluation.periodEnd
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold sm:px-6">
                                                    <span
                                                        className={getScoreClass(
                                                            evaluation.communication
                                                        )}
                                                    >
                                                        {evaluation.communication ??
                                                            "N/A"}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold sm:px-6">
                                                    <span
                                                        className={getScoreClass(
                                                            evaluation.technicalSkill
                                                        )}
                                                    >
                                                        {evaluation.technicalSkill ??
                                                            "N/A"}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold sm:px-6">
                                                    <span
                                                        className={getScoreClass(
                                                            evaluation.punctuality
                                                        )}
                                                    >
                                                        {evaluation.punctuality ??
                                                            "N/A"}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold sm:px-6">
                                                    <span
                                                        className={getScoreClass(
                                                            evaluation.taskCompletion
                                                        )}
                                                    >
                                                        {evaluation.taskCompletion ??
                                                            "N/A"}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold sm:px-6">
                                                    <span
                                                        className={getScoreClass(
                                                            evaluation.teamwork
                                                        )}
                                                    >
                                                        {evaluation.teamwork ??
                                                            "N/A"}
                                                    </span>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                    <span className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-bold text-white">
                                                        {evaluation.finalScore ??
                                                            "N/A"}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <footer className="py-8 text-center">
                    <p className="text-xs text-slate-400">
                        InternTracker · Mentor Evaluations
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default MentorEvaluations;