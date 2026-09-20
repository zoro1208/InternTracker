import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";

const AdminUsers = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("INTERN");
    const [company, setCompany] = useState("");

    const [editingUser, setEditingUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [usersResponse, companiesResponse] =
                await Promise.all([
                    api.get("/api/users"),
                    api.get("/api/companies")
                ]);

            setUsers(usersResponse.data?.users || []);
            setCompanies(companiesResponse.data?.companies || []);
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load users"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const resetForm = () => {
        setName("");
        setEmail("");
        setPassword("");
        setRole("INTERN");
        setCompany("");
        setEditingUser(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (!name.trim()) {
                setError("Name is required.");
                return;
            }

            if (!email.trim()) {
                setError("Email is required.");
                return;
            }

            if (!editingUser && !password.trim()) {
                setError("Password is required.");
                return;
            }

            const userData = {
                name: name.trim(),
                email: email.trim(),
                role,
                company: company || null
            };

            if (password.trim()) {
                userData.password = password;
            }

            if (editingUser) {
                await api.put(
                    `/api/users/${editingUser._id}`,
                    userData
                );

                setSuccess("User updated successfully.");
            } else {
                await api.post("/api/users", userData);

                setSuccess("User created successfully.");
            }

            resetForm();
            await fetchData();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to save user"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);

        setName(
            user.name ||
            user.fullName ||
            ""
        );

        setEmail(user.email || "");
        setPassword("");

        setRole(
            String(user.role || "INTERN").toUpperCase()
        );

        setCompany(
            typeof user.company === "object"
                ? user.company?._id || ""
                : user.company || ""
        );

        setError("");
        setSuccess("");
    };

    const handleDelete = async (userId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(`/api/users/${userId}`);

            setSuccess("User deleted successfully.");

            if (editingUser?._id === userId) {
                resetForm();
            }

            await fetchData();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to delete user"
            );
        }
    };

    const getCompanyName = (userCompany) => {
        if (!userCompany) {
            return "N/A";
        }

        if (typeof userCompany === "object") {
            return userCompany.name || "N/A";
        }

        const foundCompany = companies.find(
            (item) => item._id === userCompany
        );

        return foundCompany?.name || "N/A";
    };

    const getUserName = (user) => {
        return (
            user.name ||
            user.fullName ||
            "N/A"
        );
    };

    const totalAdmins = users.filter(
        (user) =>
            String(user.role || "").toUpperCase() === "ADMIN"
    ).length;

    const totalHRs = users.filter(
        (user) =>
            String(user.role || "").toUpperCase() === "HR"
    ).length;

    const totalMentors = users.filter(
        (user) =>
            String(user.role || "").toUpperCase() === "MENTOR"
    ).length;

    const totalInterns = users.filter(
        (user) =>
            String(user.role || "").toUpperCase() === "INTERN"
    ).length;

    const getRoleClasses = (role) => {
        const normalizedRole = String(role || "")
            .trim()
            .toUpperCase();

        if (normalizedRole === "ADMIN") {
            return "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200";
        }

        if (normalizedRole === "MENTOR") {
            return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
        }

        if (normalizedRole === "HR") {
            return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
        }

        if (normalizedRole === "INTERN") {
            return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
        }

        return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
    };

    const summaryCards = [
        {
            title: "Admins",
            value: totalAdmins,
            description: "Administrator accounts",
            icon: "A"
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
            description: "Mentor accounts",
            icon: "M"
        },
        {
            title: "Interns",
            value: totalInterns,
            description: "Intern accounts",
            icon: "I"
        }
    ];

    const inputClass =
        "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

    const selectClass =
        "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading users...
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
                                    User Management
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Create, update, and manage system users,
                                    roles, and company assignments.
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

                {/* User Overview */}
                <section className="mb-8">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-slate-900">
                            User Overview
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Current distribution of users by role.
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

                {/* User Form */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    {editingUser
                                        ? "Edit User"
                                        : "Add User"}
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {editingUser
                                        ? "Update the selected user's information."
                                        : "Create a new user account and assign a role."}
                                </p>
                            </div>

                            {editingUser && (
                                <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                                    Editing User
                                </span>
                            )}
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="px-5 py-6 sm:px-6"
                    >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="user-name"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Name
                                </label>

                                <input
                                    id="user-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Enter name"
                                    required
                                    className={inputClass}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="user-email"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Email
                                </label>

                                <input
                                    id="user-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="Enter email"
                                    required
                                    className={inputClass}
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="user-password"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Password
                                </label>

                                <input
                                    id="user-password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder={
                                        editingUser
                                            ? "Leave blank to keep current password"
                                            : "Enter password"
                                    }
                                    required={!editingUser}
                                    className={inputClass}
                                />

                                {editingUser && (
                                    <p className="mt-2 text-xs text-slate-400">
                                        Leave this field empty to keep the
                                        current password.
                                    </p>
                                )}
                            </div>

                            {/* Role */}
                            <div>
                                <label
                                    htmlFor="user-role"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Role
                                </label>

                                <select
                                    id="user-role"
                                    value={role}
                                    onChange={(e) =>
                                        setRole(e.target.value)
                                    }
                                    className={selectClass}
                                >
                                    <option value="INTERN">
                                        INTERN
                                    </option>

                                    <option value="MENTOR">
                                        MENTOR
                                    </option>

                                    <option value="HR">
                                        HR
                                    </option>

                                    <option value="ADMIN">
                                        ADMIN
                                    </option>
                                </select>
                            </div>

                            {/* Company */}
                            <div className="md:col-span-2">
                                <label
                                    htmlFor="user-company"
                                    className="mb-2 block text-sm font-semibold text-slate-700"
                                >
                                    Company
                                </label>

                                <select
                                    id="user-company"
                                    value={company}
                                    onChange={(e) =>
                                        setCompany(e.target.value)
                                    }
                                    className={selectClass}
                                >
                                    <option value="">
                                        No Company
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
                                                {currentCompany.name}
                                            </option>
                                        )
                                    )}
                                </select>
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
                                    : editingUser
                                        ? "Update User"
                                        : "Create User"}
                            </button>

                            {editingUser && (
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

                {/* Users Table */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Users
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    All registered users in InternTracker.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                {users.length}
                            </span>
                        </div>
                    </div>

                    {users.length === 0 ? (
                        <div className="px-5 py-12 text-center sm:px-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                                U
                            </div>

                            <h4 className="mt-4 text-base font-semibold text-slate-900">
                                No users found
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                Create your first user using the form above.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Name
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Email
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Role
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Company
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {users.map((currentUser) => (
                                        <tr
                                            key={currentUser._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {getUserName(currentUser)}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {currentUser.email || "N/A"}
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 sm:px-6">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getRoleClasses(
                                                        currentUser.role
                                                    )}`}
                                                >
                                                    {String(
                                                        currentUser.role ||
                                                        "N/A"
                                                    ).toUpperCase()}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {getCompanyName(
                                                    currentUser.company
                                                )}
                                            </td>

                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="flex justify-end gap-2">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(
                                                                currentUser
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
                                                                currentUser._id
                                                            )
                                                        }
                                                        className="rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-200"
                                                    >
                                                        Delete
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
                        InternTracker · User Management
                    </p>
                </footer>

            </div>
        </div>
    );
};

export default AdminUsers;
