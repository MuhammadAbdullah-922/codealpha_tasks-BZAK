import React, { useState } from "react";
import "../styles/login.css";
import logo from "../assets/logo.jpeg";

// 👉 Apne backend ka base URL yahan set karein
const API_BASE_URL = "http://localhost:8000/api";

// Backend (AuthController@login) sirf email + password leta hai
const FIELDS = [
  { name: "email", type: "email", placeholder: "Email Address", col: "col-12" },
  { name: "password", type: "password", placeholder: "Password", col: "col-12" },
];

const INITIAL_STATE = FIELDS.reduce((acc, field) => {
  acc[field.name] = "";
  return acc;
}, {});

const Login = () => {
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [remember, setRemember] = useState(false);

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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setSuccessMsg("");

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend 401 par "Invalid email or password" bhejta hai
        if (data.errors) {
          const fieldErrors = {};
          Object.keys(data.errors).forEach((key) => {
            fieldErrors[key] = data.errors[key][0];
          });
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
        setServerError(data.message || "Login failed. Please try again.");
        return;
      }

      // Success — token/user save karein
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", data.token);
      storage.setItem("user", JSON.stringify(data.user));

      setSuccessMsg(data.message || "Login successful!");
      setForm(INITIAL_STATE);

      // Redirect (react-router use kar rahe hain to useNavigate() se replace karein)
      window.location.href = "/";
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
                <h3>Welcome Back</h3>
                <p>Login to continue shopping</p>
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
                  {FIELDS.map((field) => (
                    <div className={field.col} key={field.name}>
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        className={`form-control ${errors[field.name] ? "is-invalid" : ""}`}
                        value={form[field.name]}
                        onChange={handleChange}
                        disabled={loading}
                        autoComplete={field.name === "password" ? "current-password" : "email"}
                      />
                      {errors[field.name] && (
                        <div className="invalid-feedback d-block">{errors[field.name]}</div>
                      )}
                    </div>
                  ))}

                  <div className="col-12 d-flex justify-content-between align-items-center flex-wrap">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="remember"
                        className="form-check-input"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        disabled={loading}
                      />
                      <label htmlFor="remember" className="form-check-label">
                        Remember me
                      </label>
                    </div>
                    <a href="/forgot-password" className="small">
                      Forgot Password?
                    </a>
                  </div>

                  <div className="col-12">
                    <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </button>
                  </div>
                </div>
              </form>

              <p className="text-center mt-3">
                Don't have an account? <a href="/register">Sign Up</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;