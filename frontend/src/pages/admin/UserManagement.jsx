import { useEffect, useState } from "react";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";
const emptyForm = {
    name: "",
    email: "",
    password: "",
    role: "INTERN",
    company: ""
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [formData, setFormData] = useState(emptyForm);

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [usersResponse, companiesResponse] =
                await Promise.all([
                    api.get("/api/users"),
                    api.get("/api/companies")
                ]);

            setUsers(usersResponse.data.users || []);
            setCompanies(companiesResponse.data.companies || []);
        } catch (error) {
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

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");
            setMessage("");

            if (editingId) {
                const dataToUpdate = {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role,
                    company: formData.company
                };

                if (formData.password) {
                    dataToUpdate.password = formData.password;
                }

                await api.put(
                    `/api/users/${editingId}`,
                    dataToUpdate
                );

                setMessage("User updated successfully.");
            } else {
                await api.post("/api/users", formData);

                setMessage("User created successfully.");
            }

            resetForm();
            fetchData();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Operation failed"
            );
        }
    };

    const handleEdit = (user) => {
        setEditingId(user._id);

        setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "",
            role: user.role || "INTERN",
            company: user.company?._id || ""
        });

        setError("");
        setMessage("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            await api.delete(`/api/users/${id}`);

            setMessage("User deleted successfully.");
            fetchData();
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to delete user"
            );
        }
    };

    return (
        <div>
            <BackButton fallback="/admin/dashboard" />
            <h1>
                {editingId
                    ? "Edit User"
                    : "Create User"}
            </h1>

            {error && <p>{error}</p>}
            {message && <p>{message}</p>}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>
                        {editingId
                            ? "New Password (optional)"
                            : "Password"}
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!editingId}
                    />
                </div>

                <div>
                    <label>Role</label>

                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                    >
                        <option value="INTERN">
                            Intern
                        </option>

                        <option value="MENTOR">
                            Mentor
                        </option>
                    </select>
                </div>

                <div>
                    <label>Company</label>

                    <select
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select Company
                        </option>

                        {companies.map((company) => (
                            <option
                                key={company._id}
                                value={company._id}
                            >
                                {company.name}
                            </option>
                        ))}
                    </select>
                </div>

                <button type="submit">
                    {editingId
                        ? "Update User"
                        : "Create User"}
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

            <h2>Users</h2>

            {loading ? (
                <p>Loading users...</p>
            ) : users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Company</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                                    {user.company?.name || "N/A"}
                                </td>
                                <td>
                                    <button
                                        onClick={() =>
                                            handleEdit(user)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(user._id)
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

export default UserManagement;