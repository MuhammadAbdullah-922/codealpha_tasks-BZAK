import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "../styles/ReturnRefundPolicy.css";

const ReturnRefundPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Return & Refund Policy | BZAK</title>

        <meta
          name="description"
          content="Read the BZAK Return & Refund Policy to learn about our 14-day return policy, eligibility requirements, exchanges, refunds, and return process."
        />

        <link
          rel="canonical"
          href="https://bzakapparel.com/return-refund-policy"
        />
      </Helmet>

      {/* BREADCRUMB */}
      <section className="bzak-breadcrumb">
        <div className="container bzak-breadcrumb-inner">
          <h1>Return & Refund Policy</h1>

          <div className="bzak-breadcrumb-path">
            <Link to="/">Home</Link> -{" "}
            <span>Return & Refund Policy</span>
          </div>
        </div>
      </section>

      {/* RETURN & REFUND POLICY */}
      <section className="bzak-privacy">
        <div className="container">
          <div className="bzak-privacy-content">

            <h2>RETURN & REFUND POLICY</h2>

            <p className="bzak-privacy-updated">
              <strong>Effective Date: August 16, 2026</strong>
            </p>

            <p>
              We have a <strong>14-day return policy</strong>, which means you
              have 14 days after receiving your item to request a return.
            </p>

            {/* 1 */}
            <h3>1. RETURN ELIGIBILITY</h3>

            <p>
              To be eligible for a return, your item must be in the same
              condition that you received it — unworn or unused, with tags
              attached, and in its original packaging.
            </p>

            <p>
              You’ll also need the receipt or other proof of purchase.
            </p>

            {/* 2 */}
            <h3>2. SALE ITEMS</h3>

            <p>
              Sale items are <strong>not eligible for returns</strong> but may
              be exchanged.
            </p>

            {/* 3 */}
            <h3>3. HOW TO START A RETURN</h3>

            <p>
              To start a return, please contact BZAK using the contact
              information below.
            </p>

            <div className="bzak-privacy-contact">
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:bzakapparel@gmail.com">
                  bzakapparel@gmail.com
                </a>
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                <a href="tel:+923157724828">
                  0315-7724828
                </a>
              </p>
            </div>

            {/* 4 */}
            <h3>4. RETURN APPROVAL & SHIPPING</h3>

            <p>
              If your return is accepted, we’ll provide you with a return
              shipping label, along with instructions on how and where to send
              your package.
            </p>

            <p>
              Items sent back to us without first requesting a return will not
              be accepted.
            </p>

            {/* 5 */}
            <h3>5. REFUNDS</h3>

            <p>
              Once we receive and inspect your returned item, we will notify
              you regarding the approval or rejection of your return.
            </p>

            <p>
              If your return is approved, the applicable refund will be
              processed according to the payment method and applicable BZAK
              refund procedures.
            </p>

            {/* 6 */}
            <h3>6. EXCHANGES</h3>

            <p>
              Eligible items may be exchanged where applicable. Sale items are
              not eligible for returns but may be exchanged.
            </p>

            <p>
              Please contact our customer service team before sending an item
              back for an exchange.
            </p>

            {/* 7 */}
            <h3>7. CONTACT US</h3>

            <p>
              You can always contact BZAK for any return or refund-related
              questions.
            </p>

            <div className="bzak-privacy-contact">
              <p>
                <strong>BZAK</strong>
              </p>

              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:bzakapparel@gmail.com">
                  bzakapparel@gmail.com
                </a>
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                <a href="tel:+923157724828">
                  0315-7724828
                </a>
              </p>
            </div>

            <p className="bzak-privacy-copyright">
              © 2026 BZAK. All Rights Reserved.
            </p>

          </div>
        </div>
      </section>
    </>
  );
};

export default ReturnRefundPolicy;