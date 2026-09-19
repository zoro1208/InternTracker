import { useEffect, useState } from "react";

import api from "../../services/api.js";
import BackButton from "../../components/BackButton.jsx";

const getToday = () => {
    return new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata"
    });
};

const getWeekStart = () => {
    const today = new Date(
        `${getToday()}T00:00:00`
    );

    const day = today.getDay();

    // Monday = 1, Sunday = 0
    const difference = day === 0 ? -6 : 1 - day;

    today.setDate(
        today.getDate() + difference
    );

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const date = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${date}`;
};

const getMonthStart = () => {
    const today = getToday();

    return `${today.substring(0, 7)}-01`;
};

const InternReports = () => {
    const [internship, setInternship] = useState(null);
    const [reports, setReports] = useState([]);

    const [periodType, setPeriodType] = useState(
        "WEEKLY"
    );

    const [selectedReport, setSelectedReport] =
        useState(null);

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                internshipResponse,
                reportsResponse
            ] = await Promise.all([
                api.get("/api/internships/my"),
                api.get("/api/reports")
            ]);

            const myInternships =
                internshipResponse.data.internships || [];

            setInternship(
                myInternships[0] || null
            );

            setReports(
                reportsResponse.data.reports || []
            );

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load reports"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePeriodTypeChange = (e) => {
        setPeriodType(e.target.value);
    };

    const handleGenerate = async (e) => {
        e.preventDefault();

        if (!internship?._id) {
            setError(
                "No internship is assigned to your account."
            );
            return;
        }

        try {
            setGenerating(true);
            setError("");
            setMessage("");
            setSelectedReport(null);

            const periodStart =
                periodType === "WEEKLY"
                    ? getWeekStart()
                    : getMonthStart();

            const periodEnd = getToday();

            const response = await api.post(
                "/api/reports/generate",
                {
                    internship: internship._id,
                    periodType,
                    periodStart,
                    periodEnd
                }
            );

            setSelectedReport(
                response.data.report
            );

            setMessage(
                "Report generated successfully."
            );

            await fetchData();

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to generate report"
            );
        } finally {
            setGenerating(false);
        }
    };

    const handleViewReport = async (id) => {
        try {
            setError("");
            setMessage("");

            const response = await api.get(
                `/api/reports/${id}`
            );

            setSelectedReport(
                response.data.report
            );

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {
            console.error(error);

            setError(
                error.response?.data?.message ||
                "Failed to load report"
            );
        }
    };

    if (loading) {
        return (
            <div>
                <BackButton fallback="/intern/dashboard" />

                <p>
                    Loading reports...
                </p>
            </div>
        );
    }

    return (
        <div>

            <BackButton fallback="/intern/dashboard" />

            <h1>My Reports</h1>

            {error && (
                <p>
                    {error}
                </p>
            )}

            {message && (
                <p>
                    {message}
                </p>
            )}

            {/* Generate Report */}

            <section>

                <h2>Generate Report</h2>

                {internship ? (
                    <form onSubmit={handleGenerate}>

                        <div>
                            <label>
                                Report Type
                            </label>

                            <select
                                value={periodType}
                                onChange={
                                    handlePeriodTypeChange
                                }
                            >
                                <option value="WEEKLY">
                                    Weekly
                                </option>

                                <option value="MONTHLY">
                                    Monthly
                                </option>
                            </select>
                        </div>

                        <p>
                            {periodType === "WEEKLY"
                                ? `Period: ${getWeekStart()} to ${getToday()}`
                                : `Period: ${getMonthStart()} to ${getToday()}`}
                        </p>

                        <button
                            type="submit"
                            disabled={generating}
                        >
                            {generating
                                ? "Generating..."
                                : "Generate Report"}
                        </button>

                    </form>
                ) : (
                    <p>
                        No internship is currently assigned
                        to your account.
                    </p>
                )}

            </section>

            <hr />

            {/* Selected Report */}

            {selectedReport && (
                <section>

                    <h2>
                        {selectedReport.periodType} Report
                    </h2>

                    <p>
                        <strong>Period:</strong>{" "}
                        {selectedReport.periodStart?.substring(
                            0,
                            10
                        )}
                        {" to "}
                        {selectedReport.periodEnd?.substring(
                            0,
                            10
                        )}
                    </p>

                    <h3>Attendance & Hours</h3>

                    <table>
                        <tbody>

                            <tr>
                                <td>
                                    Total Working Days
                                </td>
                                <td>
                                    {
                                        selectedReport.totalWorkingDays
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Updates Submitted
                                </td>
                                <td>
                                    {
                                        selectedReport.submittedUpdateDays
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Missing Updates
                                </td>
                                <td>
                                    {
                                        selectedReport.missingUpdateDays
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Expected Hours
                                </td>
                                <td>
                                    {
                                        selectedReport.totalExpectedHours
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Actual Hours
                                </td>
                                <td>
                                    {
                                        selectedReport.totalActualHours
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Overtime Hours
                                </td>
                                <td>
                                    {
                                        selectedReport.overtimeHours
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Weekend Hours
                                </td>
                                <td>
                                    {
                                        selectedReport.weekendHours
                                    }
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    <h3>Tasks</h3>

                    <table>
                        <tbody>

                            <tr>
                                <td>
                                    Total Tasks
                                </td>
                                <td>
                                    {
                                        selectedReport.totalTasks
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Completed
                                </td>
                                <td>
                                    {
                                        selectedReport.completedTasks
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    In Progress
                                </td>
                                <td>
                                    {
                                        selectedReport.inProgressTasks
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Pending
                                </td>
                                <td>
                                    {
                                        selectedReport.pendingTasks
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Delayed
                                </td>
                                <td>
                                    {
                                        selectedReport.delayedTasks
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td>
                                    Average Task Progress
                                </td>
                                <td>
                                    {
                                        selectedReport.averageTaskProgress
                                    }%
                                </td>
                            </tr>

                        </tbody>
                    </table>

                    <h3>Evaluation</h3>

                    {selectedReport.evaluationScore !== null ? (
                        <table>
                            <tbody>

                                <tr>
                                    <td>
                                        Final Score
                                    </td>
                                    <td>
                                        {
                                            selectedReport.evaluationScore
                                        }
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        Communication
                                    </td>
                                    <td>
                                        {
                                            selectedReport.communication
                                        }
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        Technical Skill
                                    </td>
                                    <td>
                                        {
                                            selectedReport.technicalSkill
                                        }
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        Punctuality
                                    </td>
                                    <td>
                                        {
                                            selectedReport.punctuality
                                        }
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        Task Completion
                                    </td>
                                    <td>
                                        {
                                            selectedReport.taskCompletion
                                        }
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        Teamwork
                                    </td>
                                    <td>
                                        {
                                            selectedReport.teamwork
                                        }
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    ) : (
                        <p>
                            No evaluation available for
                            this period.
                        </p>
                    )}

                    <h3>Daily Breakdown</h3>

                    {selectedReport.dailyBreakdown?.length === 0 ? (
                        <p>
                            No daily activity found.
                        </p>
                    ) : (
                        <table>

                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Day</th>
                                    <th>Type</th>
                                    <th>Status</th>
                                    <th>Hours</th>
                                    <th>Overtime</th>
                                </tr>
                            </thead>

                            <tbody>

                                {selectedReport.dailyBreakdown?.map(
                                    (day, index) => (
                                        <tr key={index}>

                                            <td>
                                                {day.date?.substring(
                                                    0,
                                                    10
                                                )}
                                            </td>

                                            <td>
                                                {day.day}
                                            </td>

                                            <td>
                                                {day.dayType}
                                            </td>

                                            <td>
                                                {day.status}
                                            </td>

                                            <td>
                                                {day.hoursWorked}
                                            </td>

                                            <td>
                                                {day.overtimeHours}
                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>
                    )}

                </section>
            )}

            <hr />

            {/* Previous Reports */}

            <section>

                <h2>Previous Reports</h2>

                {reports.length === 0 ? (
                    <p>
                        No reports generated yet.
                    </p>
                ) : (
                    <table>

                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Start</th>
                                <th>End</th>
                                <th>Actual Hours</th>
                                <th>Overtime</th>
                                <th>Evaluation</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {reports.map((report) => (
                                <tr key={report._id}>

                                    <td>
                                        {report.periodType}
                                    </td>

                                    <td>
                                        {report.periodStart?.substring(
                                            0,
                                            10
                                        )}
                                    </td>

                                    <td>
                                        {report.periodEnd?.substring(
                                            0,
                                            10
                                        )}
                                    </td>

                                    <td>
                                        {report.totalActualHours}
                                    </td>

                                    <td>
                                        {report.overtimeHours}
                                    </td>

                                    <td>
                                        {
                                            report.evaluationScore ??
                                            "N/A"
                                        }
                                    </td>

                                    <td>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleViewReport(
                                                    report._id
                                                )
                                            }
                                        >
                                            View
                                        </button>
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

export default InternReports;