import React, { useState } from "react";
import "../styles/register.css";
import logo from "../assets/logo.jpeg";

// 👉 Apne backend ka base URL yahan set karein
const API_BASE_URL = "http://localhost:8000/api";

// Fields ka config — yahan se add/remove/edit karke poora form badal sakte hain
const FIELDS = [
  { name: "first_name", type: "text", placeholder: "First Name", col: "col-md-6" },
  { name: "last_name", type: "text", placeholder: "Last Name", col: "col-md-6" },
  { name: "email", type: "email", placeholder: "Email Address", col: "col-12" },
  { name: "phone", type: "text", placeholder: "Phone Number", col: "col-12" },
  { name: "password", type: "password", placeholder: "Password", col: "col-12" },
  { name: "password_confirmation", type: "password", placeholder: "Confirm Password", col: "col-12" },
];

const INITIAL_STATE = FIELDS.reduce((acc, field) => {
  acc[field.name] = "";
  return acc;
}, {});

const Register = () => {
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Field type karte hi uska error hata dein
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!form.first_name.trim()) newErrors.first_name = "First name is required";
    if (!form.last_name.trim()) newErrors.last_name = "Last name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9+\-\s]{7,20}$/.test(form.phone)) {
      newErrors.phone = "Enter a valid phone number";
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

    if (!validate()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          // Backend abhi "name" field leta hai, isliye combine kar rahe hain
          name: `${form.first_name.trim()} ${form.last_name.trim()}`.trim(),
          email: form.email,
          phone: form.phone,
          password: form.password,
          password_confirmation: form.password_confirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Laravel validation errors: { errors: { field: [msg] } }
        if (data.errors) {
          const fieldErrors = {};
          Object.keys(data.errors).forEach((key) => {
            fieldErrors[key] = data.errors[key][0];
          });
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
        }
        setServerError(data.message || "Registration failed. Please try again.");
        return;
      }

      // Success
      setSuccessMsg(data.message || "Registration successful! Redirecting to login...");
      setForm(INITIAL_STATE);

      // 1.5 second baad Login page par redirect
      // (agar react-router use kar rahe hain to yahan useNavigate("/login") use karein)
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
                <h3>Create Account</h3>
                <p>Sign up to start shopping</p>
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
                      />
                      {errors[field.name] && (
                        <div className="invalid-feedback d-block">{errors[field.name]}</div>
                      )}
                    </div>
                  ))}

                  <div className="col-12">
                    <button type="submit" className="btn btn-danger w-100" disabled={loading}>
                      {loading ? "Signing Up..." : "Sign Up"}
                    </button>
                  </div>
                </div>
              </form>

              <p className="text-center mt-3">
                Already have an account? <a href="/login">Login</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;