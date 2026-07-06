import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.username.trim()) next.username = 'Username is required';
    if (!form.email.trim()) {
      next.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address';
    }
    if (!form.password) {
      next.password = 'Password is required';
    } else if (form.password.length < 8) {
      next.password = 'Password must be at least 8 characters';
    }
    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords do not match';
    }
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: 'USER',
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const message =
          data.detail ||
          data.password?.[0] ||
          data.email?.[0] ||
          data.non_field_errors?.[0] ||
          'Registration failed. Please check your details and try again.';
        throw new Error(message);
      }

      setSuccess(true);
    } catch (err) {
      setServerError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-orange-50 via-white to-orange-50 px-4 py-10">
      <div className="w-full max-w-md">

{/* Logo / brand */}
<div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">🌾</span>
          </div>
          <span className="text-stone-800 font-semibold text-lg tracking-tight">
            AnnaSetu
          </span>
        </div>
        <p className="text-center text-stone-500 text-xs mb-6">
          Bridging surplus food to those who need it
        </p>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-xl shadow-orange-900/5 overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-orange-600 to-orange-500" />

          <div className="px-8 pt-8 pb-8">
            {success ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 mx-auto rounded-full bg-orange-50 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-stone-800 mb-1">
                  Account created
                </h2>
                <p className="text-sm text-stone-500">
                  You can now sign in with your new credentials.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-6 w-full py-2.5 rounded-lg border border-orange-200 text-orange-700 text-sm font-medium hover:bg-orange-50 transition-colors"
                >
                  Back to register
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-stone-800 mb-1">
                  Create your account
                </h1>
                <br></br>

                {serverError && (
                  <div className="mb-5 flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-600">{serverError}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Ex: jane.doe"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 transition-all ${
                          errors.username
                            ? 'border-red-300 focus:ring-red-100'
                            : 'border-stone-200 focus:ring-orange-100 focus:border-orange-400'
                        }`}
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-1 text-xs text-red-500">{errors.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Ex: jane@company.com"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-lg border text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 transition-all ${
                          errors.email
                            ? 'border-red-300 focus:ring-red-100'
                            : 'border-stone-200 focus:ring-orange-100 focus:border-orange-400'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-500">{errors.email}</p>
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
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="At least 8 characters"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 transition-all ${
                          errors.password
                            ? 'border-red-300 focus:ring-red-100'
                            : 'border-stone-200 focus:ring-orange-100 focus:border-orange-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Re-enter your password"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-lg border text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 transition-all ${
                          errors.confirmPassword
                            ? 'border-red-300 focus:ring-red-100'
                            : passwordsMatch
                            ? 'border-green-300 focus:ring-green-100'
                            : 'border-stone-200 focus:ring-orange-100 focus:border-orange-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {form.confirmPassword.length > 0 && (
                      <div
                        className={`mt-1.5 flex items-center gap-1.5 text-xs transition-colors ${
                          passwordsMatch ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {passwordsMatch ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full mt-2 py-2.5 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm shadow-orange-600/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-stone-500">
                  Already have an account?{' '}
                  <a
                    href="/login"
                    className="text-orange-600 font-medium hover:text-orange-700"
                  >
                    Sign in
                  </a>
                </p>
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          By creating an account you agree to the company's terms and privacy policy.
        </p>
      </div>
    </div>
  );
}