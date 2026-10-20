import React from "react";
import { Link } from "react-router-dom";
import { FaTruck, FaMoneyBillWave, FaMapMarkerAlt, FaHeadset } from "react-icons/fa";
import "../styles/Shippingdelivery.css";

const features = [
  {
    icon: <FaTruck />,
    title: "Nationwide Delivery",
    desc: "We deliver across Pakistan through trusted courier partners, right to your doorstep.",
  },
  {
    icon: <FaMoneyBillWave />,
    title: "Cash on Delivery",
    desc: "COD is available for eligible locations, so you can pay safely on arrival.",
  },
  {
    icon: <FaMapMarkerAlt />,
    title: "Order Tracking",
    desc: "Once dispatched, tracking details may be shared to follow your order's journey.",
  },
  {
    icon: <FaHeadset />,
    title: "Dedicated Support",
    desc: "Our team is ready to help with any delivery query, quickly and professionally.",
  },
];

const ShippingDelivery = () => {
  return (
    <>
      {/* BREADCRUMB */}
      <section className="bzak-shipping-breadcrumb">
        <div className="container bzak-shipping-breadcrumb-inner">
          <h1>Shipping &amp; Delivery Policy</h1>
          <div className="bzak-shipping-breadcrumb-path">
            <Link to="/">Home</Link> - <span>Shipping &amp; Delivery Policy</span>
          </div>
        </div>
      </section>

      {/* POLICY CONTENT */}
      <section className="bzak-shipping">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-12">
              <h2 className="bzak-shipping-title">
                B-ZAK Shipping &amp; Delivery Policy
              </h2>
              <p>
                B-ZAK delivers across Pakistan through reliable, trusted
                courier services, ensuring every order reaches you safely
                and on time. We are committed to providing a smooth and
                transparent shipping experience from the moment you place
                your order to the moment it arrives at your doorstep.
              </p>
              <p>
                Orders are normally processed within <strong>1–2 working
                days</strong> and delivered within approximately{" "}
                <strong>2–5 working days</strong>, depending on the delivery
                destination. Please note that remote or hard-to-reach areas
                may require additional time for delivery.
              </p>
              <p>
                <strong>Cash on Delivery (COD)</strong> is available for
                eligible locations, giving customers a safe and convenient
                way to pay upon receiving their order. Any applicable
                shipping charges will be clearly displayed at checkout or
                communicated to you before dispatch, so there are no hidden
                costs.
              </p>
              <p>
                To ensure a smooth delivery experience, customers are
                requested to provide a complete and accurate delivery
                address along with an active phone number. Once your order
                has been dispatched, tracking details may be provided so
                you can follow its progress until it reaches you.
              </p>
              <p>
                Please note that delivery timeframes may occasionally be
                affected by public holidays, weather conditions, courier
                delays, or other circumstances beyond our control. While we
                strive to meet our estimated delivery windows, such factors
                may occasionally cause minor delays.
              </p>
              <p>
                If you receive a damaged, incorrect, or missing item, please
                contact <strong>B-ZAK Customer Support</strong> as soon as
                possible so we can resolve the issue promptly. By placing an
                order with us, you agree to the terms outlined in this
                Shipping &amp; Delivery Policy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK HIGHLIGHTS */}
      <section className="bzak-shipping-features">
        <div className="container">
          <div className="row g-4">
            {features.map((f) => (
              <div className="col-lg-3 col-md-6" key={f.title}>
                <div className="bzak-shipping-feature-card">
                  <div className="bzak-shipping-feature-icon">{f.icon}</div>
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

export default ShippingDelivery;