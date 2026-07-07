import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  XCircle,
} from "lucide-react";

import { login } from "../api/fetchApi";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const validate = () => {
    const next = {};

    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Enter a valid email";
    }

    if (!form.password) {
      next.password = "Password is required";
    }

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setServerError("");

    const validationErrors = validate();

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);

    try {
      const result = await login({
        email: form.email,
        password: form.password,
      });

      if (result.status >= 200 && result.status < 300) {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data));

        // Navigate according to your app
        window.location.href = "/";
      } else {
        setServerError(
          result.data?.detail || "Invalid email or password."
        );
      }
    } catch (err) {
      setServerError(
        err.response?.data?.detail ||
          "Invalid email or password."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-50 via-white to-orange-50 px-4 py-10">

      <div className="w-full max-w-md">

        {/* Logo */}

        <div className="flex justify-center items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">🌾</span>
          </div>

          <span className="text-lg font-semibold text-stone-800">
            AnnaSetu
          </span>
        </div>

        <p className="text-center text-xs text-stone-500 mb-6">
          Bridging surplus food to those who need it
        </p>

        {/* Card */}

        <div className="bg-white rounded-2xl border border-orange-100 shadow-xl shadow-orange-900/5 overflow-hidden">

          <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-600 to-orange-500"></div>

          <div className="px-8 py-8">

            <h1 className="text-2xl font-bold text-stone-800 mb-1">
              Welcome Back
            </h1>

            <p className="text-sm text-stone-500 mb-6">
              Sign in to continue to AnnaSetu.
            </p>

            {serverError && (
              <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                <p className="text-sm text-red-600">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Email */}

              <div>

                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Email Address
                </label>

                <div className="relative">

                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@gmail.com"
                    className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-red-300 focus:ring-red-100"
                        : "border-stone-200 focus:ring-orange-100 focus:border-orange-400"
                    }`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}

              <div>

                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Password
                </label>

                <div className="relative">

                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 ${
                      errors.password
                        ? "border-red-300 focus:ring-red-100"
                        : "border-stone-200 focus:ring-orange-100 focus:border-orange-400"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}

              </div>

              {/* Forgot Password */}

              <div className="flex justify-end">
                <a
                  href="/forgot-password"
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Button */}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold flex justify-center items-center gap-2 transition-all disabled:opacity-70 shadow-sm shadow-orange-600/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            <p className="text-center text-sm text-stone-500 mt-6">
              Don't have an account?{" "}
              <a
                href="/reg"
                className="text-orange-600 font-medium hover:text-orange-700"
              >
                Create Account
              </a>
            </p>

          </div>

        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          By signing in you agree to the company's terms and privacy policy.
        </p>

      </div>

    </div>
  );
}