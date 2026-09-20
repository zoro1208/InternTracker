import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";

const AdminInternships = () => {
    const navigate = useNavigate();

    const [internships, setInternships] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [company, setCompany] = useState("");
    const [mentor, setMentor] = useState("");
    const [intern, setIntern] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState("ACTIVE");

    const [editingInternship, setEditingInternship] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                internshipsResponse,
                companiesResponse,
                usersResponse
            ] = await Promise.all([
                api.get("/api/internships"),
                api.get("/api/companies"),
                api.get("/api/users")
            ]);

            setInternships(
                internshipsResponse.data?.internships || []
            );

            setCompanies(
                companiesResponse.data?.companies || []
            );

            setUsers(
                usersResponse.data?.users || []
            );
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load internship data"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCompany("");
        setMentor("");
        setIntern("");
        setStartDate("");
        setEndDate("");
        setStatus("ACTIVE");
        setEditingInternship(null);
    };

    const selectedCompany = companies.find(
        (currentCompany) =>
            currentCompany._id === company
    );

    const companyId =
        selectedCompany?._id || company;

    const mentors = users.filter(
        (currentUser) =>
            String(currentUser.role || "")
                .toUpperCase() === "MENTOR" &&
            String(
                typeof currentUser.company === "object"
                    ? currentUser.company?._id || ""
                    : currentUser.company || ""
            ) === String(companyId)
    );

    const interns = users.filter(
        (currentUser) =>
            String(currentUser.role || "")
                .toUpperCase() === "INTERN" &&
            String(
                typeof currentUser.company === "object"
                    ? currentUser.company?._id || ""
                    : currentUser.company || ""
            ) === String(companyId)
    );

    const handleCompanyChange = (e) => {
        const value = e.target.value;

        setCompany(value);
        setMentor("");
        setIntern("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (!title.trim()) {
                setError("Internship title is required.");
                return;
            }

            if (!company) {
                setError("Please select a company.");
                return;
            }

            if (!mentor) {
                setError("Please select a mentor.");
                return;
            }

            if (!intern) {
                setError("Please select an intern.");
                return;
            }

            if (!startDate) {
                setError("Start date is required.");
                return;
            }

            if (
                endDate &&
                new Date(endDate) < new Date(startDate)
            ) {
                setError(
                    "End date cannot be before start date."
                );
                return;
            }

            const internshipData = {
                title: title.trim(),
                description: description.trim(),
                company,
                mentor,
                intern,
                startDate,
                endDate: endDate || null,
                status
            };

            if (editingInternship) {
                await api.put(
                    `/api/internships/${editingInternship._id}`,
                    internshipData
                );

                setSuccess(
                    "Internship updated successfully."
                );
            } else {
                await api.post(
                    "/api/internships",
                    internshipData
                );

                setSuccess(
                    "Internship created successfully."
                );
            }

            resetForm();
            await fetchData();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to save internship"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (internship) => {
        setEditingInternship(internship);

        setTitle(internship.title || "");
        setDescription(
            internship.description || ""
        );

        setCompany(
            typeof internship.company === "object"
                ? internship.company?._id || ""
                : internship.company || ""
        );

        setMentor(
            typeof internship.mentor === "object"
                ? internship.mentor?._id || ""
                : internship.mentor || ""
        );

        setIntern(
            typeof internship.intern === "object"
                ? internship.intern?._id || ""
                : internship.intern || ""
        );

        setStartDate(
            internship.startDate
                ? internship.startDate.substring(0, 10)
                : ""
        );

        setEndDate(
            internship.endDate
                ? internship.endDate.substring(0, 10)
                : ""
        );

        setStatus(
            String(
                internship.status || "ACTIVE"
            ).toUpperCase()
        );

        setError("");
        setSuccess("");
    };

    const handleDelete = async (internshipId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this internship?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/api/internships/${internshipId}`
            );

            setSuccess(
                "Internship deleted successfully."
            );

            if (
                editingInternship?._id ===
                internshipId
            ) {
                resetForm();
            }

            await fetchData();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to delete internship"
            );
        }
    };

    const getCompanyName = (value) => {
        if (!value) {
            return "N/A";
        }

        if (typeof value === "object") {
            return value.name || "N/A";
        }

        const foundCompany = companies.find(
            (currentCompany) =>
                currentCompany._id === value
        );

        return foundCompany?.name || "N/A";
    };

    const getUserName = (value) => {
        if (!value) {
            return "N/A";
        }

        if (typeof value === "object") {
            return (
                value.name ||
                value.fullName ||
                value.email ||
                "N/A"
            );
        }

        const foundUser = users.find(
            (currentUser) =>
                currentUser._id === value
        );

        return (
            foundUser?.name ||
            foundUser?.fullName ||
            foundUser?.email ||
            "N/A"
        );
    };

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString();
    };

    const activeInternships = internships.filter(
        (currentInternship) =>
            String(currentInternship.status || "")
                .toUpperCase() === "ACTIVE"
    ).length;

    const completedInternships = internships.filter(
        (currentInternship) =>
            String(currentInternship.status || "")
                .toUpperCase() === "COMPLETED"
    ).length;

    const getStatusClasses = (statusValue) => {
        const normalizedStatus = String(statusValue || "")
            .trim()
            .toUpperCase();

        if (normalizedStatus === "ACTIVE") {
            return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
        }

        if (normalizedStatus === "COMPLETED") {
            return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
        }

        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    };

    const inputClass =
        "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

    const selectClass =
        "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

    const summaryCards = [
        {
            title: "Total",
            value: internships.length,
            description: "All internships",
            icon: "T"
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
        }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading internships...
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
                                    Internship Management
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Create, update, and manage internship
                                    assignments.
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

                {/* Messages */}
                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                        <p className="text-sm font-medium text-red-700">
                            {error}
                        </p>
                    </div>
                )}

                {success && (
                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <p className="text-sm font-medium text-emerald-700">
                            {success}
                        </p>
                    </div>
                )}

                {/* Internship Overview */}
                <section className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                            Internship Overview
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Current internship status summary.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

                {/* Internship Form */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    {editingInternship
                                        ? "Edit Internship"
                                        : "Create Internship"}
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {editingInternship
                                        ? "Update the selected internship assignment."
                                        : "Create an internship and assign its company, mentor, and intern."}
                                </p>
                            </div>

                            {editingInternship && (
                                <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                                    Editing Internship
                                </span>
                            )}
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="px-5 py-6 sm:px-6"
                    >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            {/* Title */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="internship-title"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Title
                                </label>

                                <input
                                    id="internship-title"
                                    type="text"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(e.target.value)
                                    }
                                    placeholder="Enter internship title"
                                    required
                                    className={inputClass}
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="internship-description"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="internship-description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Enter internship description"
                                    rows="4"
                                    className={`${inputClass} resize-y`}
                                />
                            </div>

                            {/* Company */}
                            <div>
                                <label
                                    htmlFor="internship-company"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Company
                                </label>

                                <select
                                    id="internship-company"
                                    value={company}
                                    onChange={
                                        handleCompanyChange
                                    }
                                    required
                                    className={selectClass}
                                >
                                    <option value="">
                                        Select Company
                                    </option>

                                    {companies.map(
                                        (currentCompany) => (
                                            <option
                                                key={
                                                    currentCompany._id
                                                }
                                                value={
                                                    currentCompany._id
                                                }
                                            >
                                                {
                                                    currentCompany.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* Mentor */}
                            <div>
                                <label
                                    htmlFor="internship-mentor"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Mentor
                                </label>

                                <select
                                    id="internship-mentor"
                                    value={mentor}
                                    onChange={(e) =>
                                        setMentor(
                                            e.target.value
                                        )
                                    }
                                    disabled={!company}
                                    required
                                    className={selectClass}
                                >
                                    <option value="">
                                        {company
                                            ? "Select Mentor"
                                            : "Select company first"}
                                    </option>

                                    {mentors.map(
                                        (currentMentor) => (
                                            <option
                                                key={
                                                    currentMentor._id
                                                }
                                                value={
                                                    currentMentor._id
                                                }
                                            >
                                                {
                                                    currentMentor.name ||
                                                    currentMentor.fullName ||
                                                    currentMentor.email
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                {company &&
                                    mentors.length === 0 && (
                                        <p className="mt-2 text-xs font-medium text-amber-600">
                                            No mentors found for this
                                            company.
                                        </p>
                                    )}
                            </div>

                            {/* Intern */}
                            <div>
                                <label
                                    htmlFor="internship-intern"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Intern
                                </label>

                                <select
                                    id="internship-intern"
                                    value={intern}
                                    onChange={(e) =>
                                        setIntern(
                                            e.target.value
                                        )
                                    }
                                    disabled={!company}
                                    required
                                    className={selectClass}
                                >
                                    <option value="">
                                        {company
                                            ? "Select Intern"
                                            : "Select company first"}
                                    </option>

                                    {interns.map(
                                        (currentIntern) => (
                                            <option
                                                key={
                                                    currentIntern._id
                                                }
                                                value={
                                                    currentIntern._id
                                                }
                                            >
                                                {
                                                    currentIntern.name ||
                                                    currentIntern.fullName ||
                                                    currentIntern.email
                                                }
                                            </option>
                                        )
                                    )}
                                </select>

                                {company &&
                                    interns.length === 0 && (
                                        <p className="mt-2 text-xs font-medium text-amber-600">
                                            No interns found for this
                                            company.
                                        </p>
                                    )}
                            </div>

                            {/* Status */}
                            <div>
                                <label
                                    htmlFor="internship-status"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Status
                                </label>

                                <select
                                    id="internship-status"
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(
                                            e.target.value
                                        )
                                    }
                                    className={selectClass}
                                >
                                    <option value="ACTIVE">
                                        ACTIVE
                                    </option>

                                    <option value="COMPLETED">
                                        COMPLETED
                                    </option>
                                </select>
                            </div>

                            {/* Start Date */}
                            <div>
                                <label
                                    htmlFor="internship-start-date"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Start Date
                                </label>

                                <input
                                    id="internship-start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(
                                            e.target.value
                                        )
                                    }
                                    required
                                    className={inputClass}
                                />
                            </div>

                            {/* End Date */}
                            <div>
                                <label
                                    htmlFor="internship-end-date"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    End Date
                                </label>

                                <input
                                    id="internship-end-date"
                                    type="date"
                                    value={endDate}
                                    min={
                                        startDate || undefined
                                    }
                                    onChange={(e) =>
                                        setEndDate(
                                            e.target.value
                                        )
                                    }
                                    className={inputClass}
                                />

                                <p className="mt-2 text-xs text-slate-400">
                                    End date can be left empty if not
                                    known.
                                </p>
                            </div>

                        </div>

                        {/* Form Actions */}
                        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingInternship
                                        ? "Update Internship"
                                        : "Create Internship"}
                            </button>

                            {editingInternship && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                {/* Internship List */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Internships
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    All internship assignments currently in
                                    the system.
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
                                No internships found
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                Create an internship using the form above.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Title
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Company
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Mentor
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Intern
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

                                        <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {internships.map(
                                        (currentInternship) => (
                                            <tr
                                                key={
                                                    currentInternship._id
                                                }
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="px-5 py-4 sm:px-6">
                                                    <p className="min-w-40 text-sm font-semibold text-slate-900">
                                                        {
                                                            currentInternship.title
                                                        }
                                                    </p>
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {getCompanyName(
                                                        currentInternship.company
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {getUserName(
                                                        currentInternship.mentor
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {getUserName(
                                                        currentInternship.intern
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {formatDate(
                                                        currentInternship.startDate
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                    {formatDate(
                                                        currentInternship.endDate
                                                    )}
                                                </td>

                                                <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                                                            currentInternship.status
                                                        )}`}
                                                    >
                                                        {String(
                                                            currentInternship.status ||
                                                                "N/A"
                                                        ).toUpperCase()}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 sm:px-6">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    currentInternship
                                                                )
                                                            }
                                                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    currentInternship._id
                                                                )
                                                            }
                                                            className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
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
                        InternTracker · Internship Management
                    </p>
                </footer>

            </div>
        </div>
    );
};

export default AdminInternships;