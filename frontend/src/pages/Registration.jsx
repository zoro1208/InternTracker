import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

const Register = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            await api.post("/api/auth/register", {
                name,
                email,
                password,
            });

            setSuccess("Account created successfully. Redirecting to login...");

            setName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">

                <div className="grid md:grid-cols-2">

                    {/* Left Section */}
                    <div className="hidden md:flex bg-slate-900 text-white p-10 lg:p-14 flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                                    <span className="text-lg font-bold">
                                        IT
                                    </span>
                                </div>

                                <div>
                                    <h1 className="text-xl font-bold">
                                        InternTracker
                                    </h1>

                                    <p className="text-xs text-slate-400">
                                        Internship Management System
                                    </p>
                                </div>
                            </div>

                            <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                                Start your
                                <br />
                                internship journey.
                                <br />
                                <span className="text-blue-400">
                                    Track your progress.
                                </span>
                            </h2>

                            <p className="mt-6 text-slate-400 leading-relaxed max-w-md">
                                Create your InternTracker account to access
                                internships, tasks, daily updates,
                                evaluations, and reports.
                            </p>
                        </div>

                        <div className="mt-10">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-xl bg-slate-800 p-4">
                                    <p className="text-sm font-semibold">
                                        Tasks
                                    </p>

                                    <p className="text-xs text-slate-400 mt-1">
                                        Manage work
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-800 p-4">
                                    <p className="text-sm font-semibold">
                                        Updates
                                    </p>

                                    <p className="text-xs text-slate-400 mt-1">
                                        Record progress
                                    </p>
                                </div>

                                <div className="rounded-xl bg-slate-800 p-4">
                                    <p className="text-sm font-semibold">
                                        Reports
                                    </p>

                                    <p className="text-xs text-slate-400 mt-1">
                                        View performance
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section */}
                    <div className="p-8 sm:p-10 lg:p-14">

                        {/* Mobile Brand */}
                        <div className="flex items-center gap-3 mb-8 md:hidden">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                                <span className="text-lg font-bold">
                                    IT
                                </span>
                            </div>

                            <div>
                                <h1 className="text-xl font-bold text-slate-900">
                                    InternTracker
                                </h1>

                                <p className="text-xs text-slate-500">
                                    Internship Management System
                                </p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900">
                                Create your account
                            </h2>

                            <p className="mt-2 text-sm text-slate-500">
                                Register to start using InternTracker.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Name */}
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Full name
                                </label>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Email address
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Password
                                </label>

                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    minLength={6}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400"
                                />

                                <p className="mt-1.5 text-xs text-slate-400">
                                    Minimum 6 characters.
                                </p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Confirm password
                                </label>

                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Re-enter your password"
                                    required
                                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                                    <p className="text-sm text-red-600">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Success */}
                            {success && (
                                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                                    <p className="text-sm text-green-600">
                                        {success}
                                    </p>
                                </div>
                            )}

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                        Creating account...
                                    </span>
                                ) : (
                                    "Create account"
                                )}
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-7 text-center">
                            <p className="text-sm text-slate-500">
                                Already have an account?{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="font-semibold text-blue-600 transition hover:text-blue-700"
                                >
                                    Login
                                </button>
                            </p>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <p className="text-center text-xs text-slate-400">
                                InternTracker · Internship Management System
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;