import { useEffect, useState } from "react";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";

const InternTaskManagement = () => {
    const [tasks, setTasks] = useState([]);

    const [updatingId, setUpdatingId] = useState(null);

    const [formData, setFormData] = useState({
        status: "PENDING",
        progress: 0,
        hoursSpent: 0
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchTasks = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/api/tasks");

            setTasks(response.data.tasks || []);

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load assigned tasks"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const startUpdate = (task) => {
        setUpdatingId(task._id);

        setFormData({
            status: task.status || "PENDING",
            progress: task.progress ?? 0,
            hoursSpent: task.hoursSpent ?? 0
        });

        setError("");
        setMessage("");
    };

    const cancelUpdate = () => {
        setUpdatingId(null);

        setFormData({
            status: "PENDING",
            progress: 0,
            hoursSpent: 0
        });

        setError("");
        setMessage("");
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!updatingId) {
            return;
        }

        try {
            setError("");
            setMessage("");

            await api.put(`/api/tasks/${updatingId}`, {
                status: formData.status,
                progress: Number(formData.progress),
                hoursSpent: Number(formData.hoursSpent)
            });

            setMessage(
                "Task progress updated successfully."
            );

            cancelUpdate();
            await fetchTasks();

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to update task"
            );
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "N/A";
        }

        return new Date(date).toLocaleDateString("en-IN");
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
                return status;
        }
    };

    if (loading) {
        return (
            <div>
                <BackButton fallback="/intern/dashboard" />
                <p>Loading assigned tasks...</p>
            </div>
        );
    }

    return (
        <div>

            <BackButton fallback="/intern/dashboard" />

            <h1>Assigned Tasks</h1>

            <p>
                Tasks assigned by your mentor that you are expected
                to complete.
            </p>

            {error && (
                <p>{error}</p>
            )}

            {message && (
                <p>{message}</p>
            )}

            {/* Update Task */}

            {updatingId && (
                <section>
                    <h2>Update Task Progress</h2>

                    <form onSubmit={handleUpdate}>

                        <div>
                            <label>Status</label>

                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="PENDING">
                                    Pending
                                </option>

                                <option value="IN_PROGRESS">
                                    In Progress
                                </option>

                                <option value="COMPLETED">
                                    Completed
                                </option>

                                <option value="DELAYED">
                                    Delayed
                                </option>
                            </select>
                        </div>

                        <div>
                            <label>Progress (%)</label>

                            <input
                                type="number"
                                name="progress"
                                min="0"
                                max="100"
                                value={formData.progress}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label>Hours Spent</label>

                            <input
                                type="number"
                                name="hoursSpent"
                                min="0"
                                step="0.5"
                                value={formData.hoursSpent}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit">
                            Save Progress
                        </button>

                        <button
                            type="button"
                            onClick={cancelUpdate}
                        >
                            Cancel
                        </button>

                    </form>
                </section>
            )}

            {/* Assigned Task List */}

            <section>
                <h2>My Assigned Tasks</h2>

                {tasks.length === 0 ? (
                    <p>
                        No tasks have been assigned by your mentor yet.
                    </p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Task</th>
                                <th>Description</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Progress</th>
                                <th>Hours Spent</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {tasks.map((task) => (
                                <tr key={task._id}>

                                    <td>
                                        {task.title}
                                    </td>

                                    <td>
                                        {task.description ||
                                            "No description"}
                                    </td>

                                    <td>
                                        {formatDate(task.dueDate)}
                                    </td>

                                    <td>
                                        {getStatusLabel(task.status)}
                                    </td>

                                    <td>
                                        {task.progress ?? 0}%
                                    </td>

                                    <td>
                                        {task.hoursSpent ?? 0}
                                    </td>

                                    <td>
                                        {updatingId === task._id ? (
                                            <span>
                                                Updating...
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    startUpdate(task)
                                                }
                                            >
                                                Update Progress
                                            </button>
                                        )}
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

        </div>
    );
};

export default InternTaskManagement;