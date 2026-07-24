import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/login.css";
import logo from "../assets/logo.jpeg";

const API_BASE_URL = "http://localhost:8000/api";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  // Laravel email se link is format mein aata hai:
  // http://localhost:3000/reset-password?token=xxxx&email=user@example.com
  const token = searchParams.get("token") || "";
  const emailFromUrl = searchParams.get("email") || "";

  const [form, setForm] = useState({
    email: emailFromUrl,
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (form.password !== form.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    if (!token) {
      setServerError("Invalid or missing reset link. Please request a new one.");
      return;
    }

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          token,
          email: form.email,
          password: form.password,
          password_confirmation: form.password_confirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || "Unable to reset password. The link may have expired.");
        return;
      }

      setSuccessMsg(data.message || "Password reset successfully! Redirecting to login...");
      setForm({ email: "", password: "", password_confirmation: "" });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-lg-6 col-md-8 col-12">
            <div className="auth-card">
              <div className="text-center mb-4">
                <img src={logo} alt="logo" className="auth-logo" />
                <h3>Reset Password</h3>
                <p>Enter your new password below</p>
              </div>

              {serverError && (
                <div className="alert alert-danger" role="alert">
                  {serverError}
                </div>
              )}
              {successMsg && (
                <div className="alert alert-success" role="alert">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-12">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      value={form.email}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.email && (
                      <div className="invalid-feedback d-block">{errors.email}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <input
                      type="password"
                      name="password"
                      placeholder="New Password"
                      className={`form-control ${errors.password ? "is-invalid" : ""}`}
                      value={form.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.password && (
                      <div className="invalid-feedback d-block">{errors.password}</div>
                    )}
                  </div>

                  <div className="col-12">
                    <input
                      type="password"
                      name="password_confirmation"
                      placeholder="Confirm New Password"
                      className={`form-control ${errors.password_confirmation ? "is-invalid" : ""}`}
                      value={form.password_confirmation}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.password_confirmation && (
                      <div className="invalid-feedback d-block">
                        {errors.password_confirmation}
                      </div>
                    )}
                  </div>

                  <div className="col-12">
                    <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                      {loading ? "Resetting..." : "Reset Password"}
                    </button>
                  </div>
                </div>
              </form>

              <p className="text-center mt-3">
                Remember your password? <a href="/login">Back to Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;