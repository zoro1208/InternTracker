import { useEffect, useState } from "react";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";

const emptyForm = {
    internship: "",
    title: "",
    description: "",
    dueDate: ""
};

const MentorTasks = () => {
    const [internships, setInternships] = useState([]);
    const [tasks, setTasks] = useState([]);

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
                tasksResponse
            ] = await Promise.all([
                api.get("/api/internships/my"),
                api.get("/api/tasks")
            ]);

            const myInternships =
                internshipsResponse.data.internships || [];

            setInternships(myInternships);

            setTasks(
                tasksResponse.data.tasks || []
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
                "Failed to load tasks"
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

        if (!formData.title.trim()) {
            setError(
                "Task title is required."
            );
            return;
        }

        if (!formData.dueDate) {
            setError(
                "Due date is required."
            );
            return;
        }

        try {
            setIsSubmitting(true);

            await api.post(
                "/api/tasks/broadcast",
                {
                    internship: formData.internship,
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    dueDate: formData.dueDate
                }
            );

            setMessage(
                "Task assigned successfully."
            );

            setFormData({
                ...emptyForm,
                internship: formData.internship
            });

            await fetchData();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to assign task"
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

    const getStatusLabel = (status) => {
        switch (status) {
            case "PENDING":
                return "Pending";

            case "IN_PROGRESS":
                return "In Progress";

            case "COMPLETED":
                return "Completed";

            case "DELAYED":
                return "Delayed";

            default:
                return status || "N/A";
        }
    };

    const getStatusClasses = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";

            case "IN_PROGRESS":
                return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";

            case "COMPLETED":
                return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";

            case "DELAYED":
                return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";

            default:
                return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
        }
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

    const inputClass =
        "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading tasks...
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
                            Manage Tasks
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                            Create and assign tasks to your interns and
                            monitor their progress.
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

                {/* Task Summary */}
                <section className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                            Task Overview
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Current task activity across your internships.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Internships
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {internships.length}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Available for assignment
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Total Tasks
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {tasks.length}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Assigned tasks
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                In Progress
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {inProgressTasks}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Currently being worked on
                            </p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm font-medium text-slate-500">
                                Completed
                            </p>

                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {completedTasks}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Completed tasks
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <p className="text-xs text-slate-400">
                            Pending tasks:{" "}
                            <span className="font-semibold text-slate-600">
                                {pendingTasks}
                            </span>
                        </p>
                    </div>
                </section>

                {/* Assign Task */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <h3 className="text-xl font-bold text-slate-900">
                            Assign New Task
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Create a task for an internship and assign it to
                            its intern.
                        </p>
                    </div>

                    {internships.length === 0 ? (
                        <div className="px-5 py-12 text-center sm:px-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                                T
                            </div>

                            <h4 className="mt-4 text-base font-semibold text-slate-900">
                                No internships available
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                You need an assigned internship before
                                creating tasks.
                            </p>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6 px-5 py-6 sm:px-6"
                        >
                            <div>
                                <label
                                    htmlFor="task-internship"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Internship
                                </label>

                                <select
                                    id="task-internship"
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

                            <div>
                                <label
                                    htmlFor="task-title"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Task Title
                                </label>

                                <input
                                    id="task-title"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter task title"
                                    required
                                    disabled={isSubmitting}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="task-description"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="task-description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the task"
                                    rows="4"
                                    disabled={isSubmitting}
                                    className={`${inputClass} resize-y`}
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="task-due-date"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Due Date
                                </label>

                                <input
                                    id="task-due-date"
                                    type="date"
                                    name="dueDate"
                                    value={formData.dueDate}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    className={inputClass}
                                />
                            </div>

                            <div className="border-t border-slate-100 pt-5">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting
                                        ? "Assigning..."
                                        : "Assign Task"}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {/* Assigned Tasks */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Assigned Tasks
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Monitor the tasks assigned to your interns.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                {tasks.length}
                            </span>
                        </div>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="px-5 py-14 text-center sm:px-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                                T
                            </div>

                            <h4 className="mt-4 text-base font-semibold text-slate-900">
                                No tasks assigned yet
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                Create your first task using the form above.
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
                                            Internship
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
                                    {tasks.map((task) => (
                                        <tr
                                            key={task._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 sm:px-6">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {task.title}
                                                </p>

                                                {task.description && (
                                                    <p className="mt-1 max-w-xs truncate text-xs text-slate-400">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {task.assignedTo?.name ||
                                                    task.assignedTo?.fullName ||
                                                    "N/A"}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {task.internship?.title ||
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
                                                    {getStatusLabel(
                                                        task.status
                                                    )}
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
                                                {task.hoursSpent ?? 0}
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
                        InternTracker · Mentor Tasks
                    </p>
                </footer>

            </div>
        </div>
    );
};

export default MentorTasks;