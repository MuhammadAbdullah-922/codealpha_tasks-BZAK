import React, { useState } from "react";
import "../styles/login.css";
import logo from "../assets/logo.jpeg";

const API_BASE_URL = "http://localhost:8000/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.message || "Something went wrong. Please try again.");
        return;
      }

      setSuccessMsg(data.message || "Password reset link sent! Check your email.");
      setEmail("");
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
                <h3>Forgot Password</h3>
                <p>Enter your email and we'll send you a reset link</p>
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
                      className={`form-control ${error ? "is-invalid" : ""}`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      disabled={loading}
                    />
                    {error && <div className="invalid-feedback d-block">{error}</div>}
                  </div>

                  <div className="col-12">
                    <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                      {loading ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;