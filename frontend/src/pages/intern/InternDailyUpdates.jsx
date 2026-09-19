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

            const [internshipResponse, updatesResponse] =
                await Promise.all([
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

    if (loading) {
        return (
            <div>
                <BackButton fallback="/intern/dashboard" />

                <p>
                    Loading daily updates...
                </p>
            </div>
        );
    }

    return (
        <div>

            <BackButton fallback="/intern/dashboard" />

            <h1>Daily Updates</h1>

            {message && (
                <p>
                    {message}
                </p>
            )}

            {error && (
                <p>
                    {error}
                </p>
            )}

            <section>

                <h2>Today's Daily Update</h2>

                {todaysUpdate ? (
                    <div>

                        <p>
                            Today's daily update has already been submitted.
                        </p>

                        <p>
                            <strong>Date:</strong>{" "}
                            {todaysUpdate.date
                                ? todaysUpdate.date.substring(0, 10)
                                : "Today"}
                        </p>

                        <p>
                            <strong>Hours Worked:</strong>{" "}
                            {todaysUpdate.hoursWorked}
                        </p>

                        <p>
                            <strong>Work:</strong>{" "}
                            {todaysUpdate.workDescription}
                        </p>

                        <p>
                            <strong>Challenges:</strong>{" "}
                            {todaysUpdate.challenges ||
                                "None"}
                        </p>

                        <p>
                            <strong>Learnings:</strong>{" "}
                            {todaysUpdate.learnings ||
                                "None"}
                        </p>

                    </div>
                ) : (
                    <div>

                        <p>
                            Submit your work update for today.
                        </p>

                        {!internship ? (
                            <p>
                                No internship is currently assigned
                                to your account.
                            </p>
                        ) : (
                            <form onSubmit={handleSubmit}>

                                <div>
                                    <label>
                                        Internship
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            internship.title ||
                                            "Assigned Internship"
                                        }
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <label>
                                        Work Description
                                    </label>

                                    <textarea
                                        name="workDescription"
                                        value={
                                            formData.workDescription
                                        }
                                        onChange={handleChange}
                                        placeholder="Describe what you worked on today"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label>
                                        Hours Worked
                                    </label>

                                    <input
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
                                    />
                                </div>

                                <div>
                                    <label>
                                        Challenges
                                    </label>

                                    <textarea
                                        name="challenges"
                                        value={
                                            formData.challenges
                                        }
                                        onChange={handleChange}
                                        placeholder="Mention any challenges faced"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label>
                                        Learnings
                                    </label>

                                    <textarea
                                        name="learnings"
                                        value={
                                            formData.learnings
                                        }
                                        onChange={handleChange}
                                        placeholder="Mention what you learned"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting
                                        ? "Submitting..."
                                        : "Submit Daily Update"}
                                </button>

                            </form>
                        )}

                    </div>
                )}

            </section>

            <hr />

            <section>

                <h2>My Daily Updates</h2>

                {updates.length === 0 ? (
                    <p>
                        No daily updates submitted yet.
                    </p>
                ) : (
                    <table>

                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Work</th>
                                <th>Hours</th>
                                <th>Challenges</th>
                                <th>Learnings</th>
                            </tr>
                        </thead>

                        <tbody>

                            {updates.map((update) => (
                                <tr key={update._id}>

                                    <td>
                                        {update.date
                                            ? update.date.substring(
                                                0,
                                                10
                                            )
                                            : "N/A"}
                                    </td>

                                    <td>
                                        {update.workDescription}
                                    </td>

                                    <td>
                                        {update.hoursWorked}
                                    </td>

                                    <td>
                                        {update.challenges ||
                                            "None"}
                                    </td>

                                    <td>
                                        {update.learnings ||
                                            "None"}
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

export default InternDailyUpdates;