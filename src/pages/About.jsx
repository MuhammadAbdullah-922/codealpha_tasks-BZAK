import React from "react";
import { Link } from "react-router-dom";
import { FaBoxOpen, FaHeadset, FaTruck, FaLock } from "react-icons/fa";
import "../styles/About.css";

// Replace this with your actual about-us image (add file in src/assets)
import aboutImg from "../assets/pic3.jpeg";

const stats = [
  { value: "0.1", suffix: "k", label: "Stores" },
  { value: "23", suffix: "k", label: "Customers" },
  { value: "2", suffix: "k", label: "Products" },
];

const features = [
  {
    icon: <FaBoxOpen />,
    title: "Premium Packing",
    desc: "Every order is packed with care to keep your apparel wrinkle-free.",
  },
  {
    icon: <FaHeadset />,
    title: "24X7 Support",
    desc: "Our team is available around the clock for any query you have.",
  },
  {
    icon: <FaTruck />,
    title: "Delivery in 5 Days",
    desc: "Fast, reliable shipping straight to your doorstep, nationwide.",
  },
  {
    icon: <FaLock />,
    title: "Payment Secure",
    desc: "100% secure checkout with encrypted, trusted payment gateways.",
  },
];

const About = () => {
  return (
    <>
      {/* BREADCRUMB */}
      <section className="bzak-breadcrumb">
        <div className="container bzak-breadcrumb-inner">
          <h1>About Us</h1>
          <div className="bzak-breadcrumb-path">
            <Link to="/">Home</Link> - <span>About Us</span>
          </div>
        </div>
      </section>

      {/* ABOUT CONTENT */}
      <section className="bzak-about">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <h2 className="bzak-about-title">About B-ZAK</h2>
              <p>
                B-ZAK is a premium clothing brand built for people who want
                everyday confidence without compromising on style. Every
                piece we design blends quality fabric with modern
                silhouettes made to last.
              </p>
              <p>
                From casual streetwear to smart everyday essentials, our
                collections are crafted to fit real life — comfortable,
                durable, and always on trend, for every season and occasion.
              </p>
              <p>
                We work directly with trusted manufacturers to keep our
                quality high and our prices fair, so you always get more
                value than what you pay for, order after order.
              </p>

              <div className="bzak-about-stats">
                {stats.map((s) => (
                  <div className="bzak-stat" key={s.label}>
                    <h3>
                      {s.value}
                      <span>{s.suffix}</span>
                    </h3>
                    <p>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-6">
              <div className="bzak-about-img">
                <img src={aboutImg} alt="About B-ZAK" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bzak-about-features">
        <div className="container">
          <div className="row g-4">
            {features.map((f) => (
              <div className="col-lg-3 col-md-6" key={f.title}>
                <div className="bzak-feature-card">
                  <div className="bzak-feature-icon">{f.icon}</div>
                  <h5>{f.title}</h5>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;