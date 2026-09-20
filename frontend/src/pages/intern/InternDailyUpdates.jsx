import { useEffect, useState } from "react";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";

const emptyForm = {
    workDescription: "",
    hoursWorked: "",
    challenges: "",
    learnings: ""
};

const InternDailyUpdates = () => {
    const [internship, setInternship] = useState(null);
    const [updates, setUpdates] = useState([]);
    const [formData, setFormData] = useState(emptyForm);

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const getToday = () => {
        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                internshipResponse,
                updatesResponse
            ] = await Promise.all([
                api.get("/api/internships/my"),
                api.get("/api/daily-updates")
            ]);

            const internships =
                internshipResponse.data.internships || [];

            setInternship(internships[0] || null);

            setUpdates(
                updatesResponse.data.dailyUpdates || []
            );
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load daily updates"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const todaysUpdate = updates.find((update) => {
        if (!update.date) {
            return false;
        }

        const updateDate = new Date(update.date);

        const year = updateDate.getFullYear();

        const month = String(
            updateDate.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            updateDate.getDate()
        ).padStart(2, "0");

        return (
            `${year}-${month}-${day}` ===
            getToday()
        );
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        setError("");
        setMessage("");

        if (todaysUpdate) {
            setError(
                "Today's daily update has already been submitted."
            );
            return;
        }

        if (!internship?._id) {
            setError(
                "No internship is assigned to your account."
            );
            return;
        }

        if (!formData.workDescription.trim()) {
            setError(
                "Work description is required."
            );
            return;
        }

        if (formData.hoursWorked === "") {
            setError(
                "Hours worked is required."
            );
            return;
        }

        if (Number(formData.hoursWorked) < 0) {
            setError(
                "Hours worked cannot be negative."
            );
            return;
        }

        setIsSubmitting(true);

        try {
            await api.post(
                "/api/daily-updates",
                {
                    internship: internship._id,
                    workDescription:
                        formData.workDescription.trim(),
                    hoursWorked:
                        Number(formData.hoursWorked),
                    challenges:
                        formData.challenges.trim(),
                    learnings:
                        formData.learnings.trim()
                }
            );

            setMessage(
                "Daily update submitted successfully."
            );

            resetForm();

            await fetchData();
        } catch (error) {
            console.error(
                "Daily update error:",
                error.response?.data
            );

            setError(
                error.response?.data?.message ||
                "Failed to submit daily update"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString("en-IN");
    };

    const inputClass =
        "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading daily updates...
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
                    <BackButton fallback="/intern/dashboard" />
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
                            Daily Updates
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                            Submit your work, hours, challenges, and
                            learnings for today.
                        </p>
                    </div>
                </header>

                {/* Messages */}
                {message && (
                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="text-sm font-medium text-emerald-700">
                            {message}
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm font-medium text-red-700">
                            {error}
                        </p>
                    </div>
                )}

                {/* Today's Update */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Today's Daily Update
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Only one daily update can be submitted
                                    for the current day.
                                </p>
                            </div>

                            <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                {getToday()}
                            </span>
                        </div>
                    </div>

                    {todaysUpdate ? (
                        <div className="p-5 sm:p-6">

                            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                <p className="text-sm font-semibold text-emerald-800">
                                    Today's daily update has already been
                                    submitted.
                                </p>

                                <p className="mt-1 text-xs text-emerald-700">
                                    You cannot submit another update for
                                    today.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Date
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {formatDate(
                                            todaysUpdate.date
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Hours Worked
                                    </p>

                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                        {todaysUpdate.hoursWorked ?? 0}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Work
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-700">
                                        {todaysUpdate.workDescription ||
                                            "N/A"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Challenges
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-700">
                                        {todaysUpdate.challenges ||
                                            "None"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        Learnings
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-700">
                                        {todaysUpdate.learnings ||
                                            "None"}
                                    </p>
                                </div>

                            </div>
                        </div>
                    ) : (
                        <div className="p-5 sm:p-6">

                            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                                <p className="text-sm font-semibold text-blue-900">
                                    Submit your work update for today.
                                </p>

                                <p className="mt-1 text-xs leading-5 text-blue-700">
                                    You can submit only today's update.
                                    Tomorrow's update will become available
                                    on the next day.
                                </p>
                            </div>

                            {!internship ? (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                                    <p className="text-sm font-semibold text-amber-900">
                                        No internship is currently assigned
                                        to your account.
                                    </p>

                                    <p className="mt-1 text-xs text-amber-700">
                                        An internship assignment is required
                                        before submitting a daily update.
                                    </p>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >

                                    {/* Internship */}
                                    <div>
                                        <label
                                            htmlFor="daily-internship"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Internship
                                        </label>

                                        <input
                                            id="daily-internship"
                                            type="text"
                                            value={
                                                internship.title ||
                                                "Assigned Internship"
                                            }
                                            readOnly
                                            className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600 outline-none"
                                        />
                                    </div>

                                    {/* Work Description */}
                                    <div>
                                        <label
                                            htmlFor="work-description"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Work Description
                                        </label>

                                        <textarea
                                            id="work-description"
                                            name="workDescription"
                                            value={
                                                formData.workDescription
                                            }
                                            onChange={handleChange}
                                            placeholder="Describe what you worked on today"
                                            rows="5"
                                            required
                                            disabled={isSubmitting}
                                            className={`${inputClass} resize-y`}
                                        />

                                        <p className="mt-2 text-xs text-slate-400">
                                            Describe the work completed
                                            today.
                                        </p>
                                    </div>

                                    {/* Hours */}
                                    <div>
                                        <label
                                            htmlFor="hours-worked"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Hours Worked
                                        </label>

                                        <input
                                            id="hours-worked"
                                            type="number"
                                            name="hoursWorked"
                                            value={
                                                formData.hoursWorked
                                            }
                                            onChange={handleChange}
                                            min="0"
                                            step="0.5"
                                            placeholder="Enter hours worked"
                                            required
                                            disabled={isSubmitting}
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Challenges */}
                                    <div>
                                        <label
                                            htmlFor="daily-challenges"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Challenges
                                        </label>

                                        <textarea
                                            id="daily-challenges"
                                            name="challenges"
                                            value={
                                                formData.challenges
                                            }
                                            onChange={handleChange}
                                            placeholder="Mention any challenges faced"
                                            rows="4"
                                            disabled={isSubmitting}
                                            className={`${inputClass} resize-y`}
                                        />
                                    </div>

                                    {/* Learnings */}
                                    <div>
                                        <label
                                            htmlFor="daily-learnings"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Learnings
                                        </label>

                                        <textarea
                                            id="daily-learnings"
                                            name="learnings"
                                            value={
                                                formData.learnings
                                            }
                                            onChange={handleChange}
                                            placeholder="Mention what you learned"
                                            rows="4"
                                            disabled={isSubmitting}
                                            className={`${inputClass} resize-y`}
                                        />
                                    </div>

                                    <div className="border-t border-slate-100 pt-5">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {isSubmitting
                                                ? "Submitting..."
                                                : "Submit Daily Update"}
                                        </button>
                                    </div>

                                </form>
                            )}

                        </div>
                    )}
                </section>

                {/* Update History */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    My Daily Updates
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    History of your submitted work updates.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                {updates.length}
                            </span>
                        </div>
                    </div>

                    {updates.length === 0 ? (
                        <div className="px-5 py-14 text-center sm:px-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                                U
                            </div>

                            <h4 className="mt-4 text-base font-semibold text-slate-900">
                                No daily updates submitted yet
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                Your submitted updates will appear here.
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

                                        <th className="min-w-[300px] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Work
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Hours
                                        </th>

                                        <th className="min-w-[220px] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Challenges
                                        </th>

                                        <th className="min-w-[220px] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Learnings
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {updates.map((update) => (
                                        <tr
                                            key={update._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-900 sm:px-6">
                                                {formatDate(
                                                    update.date
                                                )}
                                            </td>

                                            <td className="px-5 py-4 sm:px-6">
                                                <p className="max-w-md text-sm leading-6 text-slate-600">
                                                    {update.workDescription ||
                                                        "N/A"}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-slate-700 sm:px-6">
                                                {update.hoursWorked ?? 0}
                                            </td>

                                            <td className="px-5 py-4 sm:px-6">
                                                <p className="max-w-sm text-sm leading-6 text-slate-600">
                                                    {update.challenges ||
                                                        "None"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 sm:px-6">
                                                <p className="max-w-sm text-sm leading-6 text-slate-600">
                                                    {update.learnings ||
                                                        "None"}
                                                </p>
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
                        InternTracker · Daily Updates
                    </p>
                </footer>

            </div>
        </div>
    );
};

export default InternDailyUpdates;

