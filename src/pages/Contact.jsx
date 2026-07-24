import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";
import "../styles/Contact.css";
import { submitContactForm } from "../services/api";

// Static contact details — edit directly here whenever they change
const info = {
  address: "Street No. 15, House No. 14, New Multan, Multan, Pakistan",
  phone: "+92 315 7724828",
  email: "Bzakapparel@gmail.com",
  hours: "Mon - Sat: 9:00 AM - 8:00 PM",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Street%20No.%2015%2C%20House%20No.%2014%2C%20New%20Multan%2C%20Multan%2C%20Pakistan&t=&z=15&ie=UTF8&iwloc=&output=embed",
};

const initialForm = { name: "", email: "", subject: "", message: "" };

const Contact = () => {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!form.subject.trim()) newErrors.subject = "Subject is required";
    if (!form.message.trim()) newErrors.message = "Message can't be empty";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setStatus("sending");
    try {
      await submitContactForm(form);
      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      console.log("Contact form error:", err);
      setStatus("error");
    }
  };

  return (
    <>
      {/* BREADCRUMB */}
      <section className="bzak-breadcrumb">
        <div className="container bzak-breadcrumb-inner">
          <h1>Contact Us</h1>
          <div className="bzak-breadcrumb-path">
            <Link to="/">Home</Link> - <span>Contact Us</span>
          </div>
        </div>
      </section>

      {/* CONTACT INFO CARDS */}
      <section className="bzak-contact-info">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="bzak-contact-card">
                <div className="bzak-contact-icon">
                  <FaMapMarkerAlt />
                </div>
                <h5>Our Address</h5>
                <p>{info.address}</p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="bzak-contact-card">
                <div className="bzak-contact-icon">
                  <FaPhoneAlt />
                </div>
                <h5>Call Us</h5>
                <p>
                  <a href={`tel:${info.phone.replace(/[^+\d]/g, "")}`}>
                    {info.phone}
                  </a>
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="bzak-contact-card">
                <div className="bzak-contact-icon">
                  <FaEnvelope />
                </div>
                <h5>Email Us</h5>
                <p>
                  <a href={`mailto:${info.email}`}>{info.email}</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORM + MAP */}
      <section className="bzak-contact-main">
        <div className="container">
          <div className="row g-5">
            {/* FORM */}
            <div className="col-lg-6">
              <h2 className="bzak-contact-title">Send Us a Message</h2>
              <p className="bzak-contact-sub">
                Have a question about an order, sizing, or anything else?
                Fill out the form below and our team will get back to you
                within 24 hours.
              </p>

              {status === "success" && (
                <div className="bzak-alert bzak-alert-success">
                  Your message has been sent successfully. We'll get back to
                  you soon!
                </div>
              )}
              {status === "error" && (
                <div className="bzak-alert bzak-alert-error">
                  Something went wrong while sending your message. Please
                  try again.
                </div>
              )}

              <form className="bzak-contact-form" onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                  <div className="col-sm-6">
                    <label htmlFor="name">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={errors.name ? "bzak-input-error" : ""}
                      placeholder="Enter your Full Name"
                    />
                    {errors.name && <span className="bzak-field-error">{errors.name}</span>}
                  </div>

                  <div className="col-sm-6">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={errors.email ? "bzak-input-error" : ""}
                      placeholder="Enter Email"
                    />
                    {errors.email && <span className="bzak-field-error">{errors.email}</span>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className={errors.subject ? "bzak-input-error" : ""}
                      placeholder="Order inquiry, sizing help, etc."
                    />
                    {errors.subject && <span className="bzak-field-error">{errors.subject}</span>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="5"
                      value={form.message}
                      onChange={handleChange}
                      className={errors.message ? "bzak-input-error" : ""}
                      placeholder="Write your message here..."
                    />
                    {errors.message && <span className="bzak-field-error">{errors.message}</span>}
                  </div>

                  <div className="col-12">
                    <button
                      type="submit"
                      className="bzak-contact-submit"
                      disabled={status === "sending"}
                    >
                      <FaPaperPlane />
                      {status === "sending" ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* MAP + HOURS */}
            <div className="col-lg-6">
              <div className="bzak-contact-map">
                <iframe
                  src={info.mapEmbedUrl}
                  title="B-ZAK Location"
                  width="100%"
                  height="320"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="bzak-contact-hours">
                <div className="bzak-contact-hours-icon">
                  <FaClock />
                </div>
                <div>
                  <h5>Working Hours</h5>
                  <p>{info.hours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;