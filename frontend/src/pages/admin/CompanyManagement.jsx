import { useEffect, useState } from "react";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        location: "",
        website: "",
        contactEmail: "",
        contactPhone: ""
    });

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/api/companies");

            setCompanies(response.data.companies || []);
        } catch (error) {
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            location: "",
            website: "",
            contactEmail: "",
            contactPhone: ""
        });

        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");
            setMessage("");

            if (editingId) {
                await api.put(
                    `/api/companies/${editingId}`,
                    formData
                );

                setMessage("Company updated successfully.");
            } else {
                await api.post(
                    "/api/companies",
                    formData
                );

                setMessage("Company created successfully.");
            }

            resetForm();
            fetchCompanies();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Operation failed"
            );
        }
    };

    const handleEdit = (company) => {
        setEditingId(company._id);

        setFormData({
            name: company.name || "",
            description: company.description || "",
            location: company.location || "",
            website: company.website || "",
            contactEmail: company.contactEmail || "",
            contactPhone: company.contactPhone || ""
        });

        setMessage("");
        setError("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this company?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            await api.delete(`/api/companies/${id}`);

            setMessage("Company deleted successfully.");

            fetchCompanies();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to delete company"
            );
        }
    };

    return (
        <div>
            <BackButton fallback="/admin/dashboard" />

            <h1>
                {editingId
                    ? "Edit Company"
                    : "Create Company"}
            </h1>

            {error && (
                <p>{error}</p>
            )}

            {message && (
                <p>{message}</p>
            )}

            {/* Company Form */}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Company Name</label>

                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Description</label>

                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Location</label>

                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Website</label>

                    <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Contact Email</label>

                    <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Contact Phone</label>

                    <input
                        type="text"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit">
                    {editingId
                        ? "Update Company"
                        : "Create Company"}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={resetForm}
                    >
                        Cancel
                    </button>
                )}

            </form>

            <hr />

            {/* Company List */}

            <h2>Companies</h2>

            {loading ? (
                <p>Loading companies...</p>
            ) : companies.length === 0 ? (
                <p>No companies found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Location</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {companies.map((company) => (
                            <tr key={company._id}>
                                <td>
                                    {company.name}
                                </td>

                                <td>
                                    {company.location || "N/A"}
                                </td>

                                <td>
                                    {company.contactEmail || "N/A"}
                                </td>

                                <td>
                                    {company.contactPhone || "N/A"}
                                </td>

                                <td>
                                    <button
                                        onClick={() =>
                                            handleEdit(company)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(company._id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

        </div>
    );
};

export default CompanyManagement;