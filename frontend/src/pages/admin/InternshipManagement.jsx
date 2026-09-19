import { useEffect, useState } from "react";
import BackButton from "../../components/BackButton.jsx";
import api from "../../services/api.js";

const emptyForm = {
    title: "",
    description: "",
    company: "",
    mentor: "",
    intern: "",
    startDate: "",
    endDate: "",
    status: "UPCOMING"
};

const InternshipManagement = () => {
    const [internships, setInternships] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);

    const [formData, setFormData] = useState(emptyForm);

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

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
                internshipsResponse.data.internships || []
            );

            setCompanies(
                companiesResponse.data.companies || []
            );

            setUsers(
                usersResponse.data.users || []
            );
        } catch (error) {
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

    const mentors = users.filter(
        (user) => user.role === "MENTOR"
    );

    const interns = users.filter(
        (user) => user.role === "INTERN"
    );

    const selectedCompany = formData.company;

    const filteredMentors = mentors.filter(
        (mentor) =>
            mentor.company?._id === selectedCompany
    );

    const filteredInterns = interns.filter(
        (intern) =>
            intern.company?._id === selectedCompany
    );

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => {
            const updated = {
                ...previous,
                [name]: value
            };

            // Changing company invalidates existing mentor/intern
            if (name === "company") {
                updated.mentor = "";
                updated.intern = "";
            }

            return updated;
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

            const payload = {
                ...formData,
                endDate: formData.endDate || null
            };

            if (editingId) {
                await api.put(
                    `/api/internships/${editingId}`,
                    payload
                );

                setMessage(
                    "Internship updated successfully."
                );
            } else {
                await api.post(
                    "/api/internships",
                    payload
                );

                setMessage(
                    "Internship created successfully."
                );
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

    const handleEdit = (internship) => {
        setEditingId(internship._id);

        setFormData({
            title: internship.title || "",
            description: internship.description || "",
            company: internship.company?._id || "",
            mentor: internship.mentor?._id || "",
            intern: internship.intern?._id || "",
            startDate: internship.startDate
                ? internship.startDate.substring(0, 10)
                : "",
            endDate: internship.endDate
                ? internship.endDate.substring(0, 10)
                : "",
            status: internship.status || "UPCOMING"
        });

        setError("");
        setMessage("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this internship?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            await api.delete(
                `/api/internships/${id}`
            );

            setMessage(
                "Internship deleted successfully."
            );

            fetchData();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to delete internship"
            );
        }
    };

    return (
        <div>
            <BackButton fallback="/admin/dashboard" />
            <h1>
                {editingId
                    ? "Edit Internship"
                    : "Create Internship"}
            </h1>

            {error && <p>{error}</p>}
            {message && <p>{message}</p>}

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Title</label>

                    <input
                        type="text"
                        name="title"
                        value={formData.title}
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

                <div>
                    <label>Mentor</label>

                    <select
                        name="mentor"
                        value={formData.mentor}
                        onChange={handleChange}
                        required
                        disabled={!formData.company}
                    >
                        <option value="">
                            Select Mentor
                        </option>

                        {filteredMentors.map((mentor) => (
                            <option
                                key={mentor._id}
                                value={mentor._id}
                            >
                                {mentor.name} - {mentor.email}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Intern</label>

                    <select
                        name="intern"
                        value={formData.intern}
                        onChange={handleChange}
                        required
                        disabled={!formData.company}
                    >
                        <option value="">
                            Select Intern
                        </option>

                        {filteredInterns.map((intern) => (
                            <option
                                key={intern._id}
                                value={intern._id}
                            >
                                {intern.name} - {intern.email}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Start Date</label>

                    <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label>End Date</label>

                    <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label>Status</label>

                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="UPCOMING">
                            Upcoming
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="COMPLETED">
                            Completed
                        </option>
                    </select>
                </div>

                <button type="submit">
                    {editingId
                        ? "Update Internship"
                        : "Create Internship"}
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

            <h2>Internships</h2>

            {loading ? (
                <p>Loading internships...</p>
            ) : internships.length === 0 ? (
                <p>No internships found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Company</th>
                            <th>Mentor</th>
                            <th>Intern</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {internships.map((internship) => (
                            <tr key={internship._id}>
                                <td>
                                    {internship.title}
                                </td>

                                <td>
                                    {internship.company?.name ||
                                        "N/A"}
                                </td>

                                <td>
                                    {internship.mentor?.name ||
                                        "N/A"}
                                </td>

                                <td>
                                    {internship.intern?.name ||
                                        "N/A"}
                                </td>

                                <td>
                                    {internship.startDate
                                        ? internship.startDate.substring(0, 10)
                                        : "N/A"}
                                </td>

                                <td>
                                    {internship.endDate
                                        ? internship.endDate.substring(0, 10)
                                        : "Ongoing"}
                                </td>

                                <td>
                                    {internship.status}
                                </td>

                                <td>
                                    <button
                                        onClick={() =>
                                            handleEdit(internship)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                internship._id
                                            )
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

export default InternshipManagement;