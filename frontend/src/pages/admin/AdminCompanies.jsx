import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";

const AdminCompanies = () => {
    const navigate = useNavigate();

    const [companies, setCompanies] = useState([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");

    const [editingCompany, setEditingCompany] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/api/companies");

            setCompanies(
                response.data?.companies || []
            );
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load companies"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const resetForm = () => {
        setName("");
        setDescription("");
        setLocation("");
        setEditingCompany(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const companyData = {
                name: name.trim(),
                description: description.trim(),
                location: location.trim()
            };

            if (!companyData.name) {
                setError("Company name is required.");
                return;
            }

            if (editingCompany) {
                await api.put(
                    `/api/companies/${editingCompany._id}`,
                    companyData
                );

                setSuccess(
                    "Company updated successfully."
                );
            } else {
                await api.post(
                    "/api/companies",
                    companyData
                );

                setSuccess(
                    "Company created successfully."
                );
            }

            resetForm();
            await fetchCompanies();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to save company"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (company) => {
        setEditingCompany(company);

        setName(company.name || "");
        setDescription(company.description || "");
        setLocation(company.location || "");

        setError("");
        setSuccess("");
    };

    const handleDelete = async (companyId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this company?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/api/companies/${companyId}`
            );

            setSuccess(
                "Company deleted successfully."
            );

            if (
                editingCompany?._id === companyId
            ) {
                resetForm();
            }

            await fetchCompanies();
        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to delete company"
            );
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
                    <div className="flex flex-col items-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>

                        <p className="mt-4 text-sm font-medium text-slate-600">
                            Loading companies...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

                {/* Back */}
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
                                    Company Management
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-400">
                                    Add, update, and manage companies used
                                    for internships.
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

                {/* Form */}
                <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    {editingCompany
                                        ? "Edit Company"
                                        : "Add Company"}
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {editingCompany
                                        ? "Update the selected company's details."
                                        : "Enter the details for a new company."}
                                </p>
                            </div>

                            {editingCompany && (
                                <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-inset ring-amber-200">
                                    Editing
                                </span>
                            )}
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 px-5 py-6 sm:px-6"
                    >

                        {/* Company Name */}
                        <div>
                            <label
                                htmlFor="company-name"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Company Name
                            </label>

                            <input
                                id="company-name"
                                type="text"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                placeholder="Enter company name"
                                required
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label
                                htmlFor="company-description"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Description
                            </label>

                            <textarea
                                id="company-description"
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                placeholder="Enter company description"
                                rows="4"
                                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label
                                htmlFor="company-location"
                                className="mb-2 block text-sm font-semibold text-slate-700"
                            >
                                Location
                            </label>

                            <input
                                id="company-location"
                                type="text"
                                value={location}
                                onChange={(e) =>
                                    setLocation(e.target.value)
                                }
                                placeholder="Enter company location"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">

                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {saving
                                    ? "Saving..."
                                    : editingCompany
                                        ? "Update Company"
                                        : "Add Company"}
                            </button>

                            {editingCompany && (
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

                {/* Companies List */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Companies
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    All companies available for internships.
                                </p>
                            </div>

                            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                                {companies.length}
                            </span>
                        </div>
                    </div>

                    {companies.length === 0 ? (
                        <div className="px-5 py-12 text-center sm:px-6">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500">
                                C
                            </div>

                            <h4 className="mt-4 text-base font-semibold text-slate-900">
                                No companies found
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                                Add your first company using the form above.
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

                                        <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Description
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Location
                                        </th>

                                        <th className="whitespace-nowrap px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-6">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {companies.map((company) => (
                                        <tr
                                            key={company._id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-5 py-4 sm:px-6">
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {company.name}
                                                </p>
                                            </td>

                                            <td className="max-w-md px-5 py-4 sm:px-6">
                                                <p className="text-sm leading-6 text-slate-600">
                                                    {company.description ||
                                                        "N/A"}
                                                </p>
                                            </td>

                                            <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600 sm:px-6">
                                                {company.location || "N/A"}
                                            </td>

                                            <td className="px-5 py-4 sm:px-6">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(company)
                                                        }
                                                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                company._id
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
                        InternTracker · Company Management
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default AdminCompanies;