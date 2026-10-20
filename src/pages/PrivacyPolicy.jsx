import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "../styles/PrivacyPolicy.css";

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | BZAK</title>

        <meta
          name="description"
          content="Read the BZAK Privacy Policy to learn how we collect, use, store, and protect your personal information."
        />

        <link
          rel="canonical"
          href="https://bzakapparel.com/privacy-policy"
        />
      </Helmet>

      {/* BREADCRUMB */}
      <section className="bzak-breadcrumb">
        <div className="container bzak-breadcrumb-inner">
          <h1>Privacy Policy</h1>

          <div className="bzak-breadcrumb-path">
            <Link to="/">Home</Link> - <span>Privacy Policy</span>
          </div>
        </div>
      </section>

      {/* PRIVACY POLICY */}
      <section className="bzak-privacy">
        <div className="container">

          <div className="bzak-privacy-content">

            <h2>PRIVACY POLICY</h2>

            <p className="bzak-privacy-updated">
              <strong>Effective Date: August 16, 2026</strong>
            </p>

            <p>
              At BZAK, we respect your privacy and are committed to protecting
              the personal information you provide when you visit or make a
              purchase through our online store.
            </p>

            <p>
              This Privacy Policy explains how BZAK collects, uses, stores,
              and protects your information when you visit our website, place
              an order, create an account, contact us, or otherwise use our
              services.
            </p>

            <p>
              By using the BZAK website, you agree to the practices described
              in this Privacy Policy.
            </p>

            {/* 1 */}
            <h3>1. INFORMATION WE COLLECT</h3>

            <p>
              When you visit or purchase from our website, we may collect
              certain information necessary to provide our services.
            </p>

            <h4>Personal Information</h4>

            <p>Depending on how you interact with our website, we may collect:</p>

            <ul>
              <li>Full name</li>
              <li>Billing and shipping address</li>
              <li>Phone number</li>
              <li>Email address</li>
              <li>Account login information</li>
              <li>Order and purchase history</li>
              <li>Product preferences</li>
              <li>
                Information you provide when contacting our customer support
              </li>
              <li>Any other information you voluntarily provide to us</li>
            </ul>

            <h4>Payment Information</h4>

            <p>
              When you make a purchase, payment information may be processed
              through our third-party payment providers.
            </p>

            <p>
              BZAK does not intentionally store complete credit/debit card
              numbers or banking credentials on our website. Payment
              information may be handled directly by the applicable payment
              service provider according to its own privacy and security
              policies.
            </p>

            {/* 2 */}
            <h3>2. HOW WE USE YOUR INFORMATION</h3>

            <p>We may use the information we collect to:</p>

            <ul>
              <li>Process and fulfill your orders</li>
              <li>Deliver your products</li>
              <li>Confirm and communicate about your orders</li>
              <li>Contact you regarding your purchase</li>
              <li>Provide customer support</li>
              <li>Process returns, exchanges, and refunds</li>
              <li>Maintain and manage your customer account</li>
              <li>Improve our products, website, and services</li>
              <li>Prevent fraud, unauthorized transactions, and misuse</li>
              <li>Maintain website security</li>
              <li>
                Send promotional offers and marketing communications where
                permitted
              </li>
              <li>Understand customer preferences and website usage</li>
              <li>
                Comply with applicable legal and regulatory requirements
              </li>
            </ul>

            <p>
              We only intend to use your personal information for legitimate
              business purposes and purposes reasonably connected with
              providing our services.
            </p>

            {/* 3 */}
            <h3>3. ORDER AND DELIVERY INFORMATION</h3>

            <p>
              When you place an order with BZAK, we may share necessary
              information such as your name, phone number, and delivery
              address with our courier or logistics partners so that your
              order can be delivered.
            </p>

            <p>
              We only provide information reasonably necessary to complete the
              delivery or related service.
            </p>

            {/* 4 */}
            <h3>4. COOKIES AND TRACKING TECHNOLOGIES</h3>

            <p>
              Our website may use cookies and similar technologies to improve
              your browsing experience.
            </p>

            <p>Cookies may help us:</p>

            <ul>
              <li>Remember items in your shopping cart</li>
              <li>Keep you signed into your account</li>
              <li>Understand how visitors use our website</li>
              <li>Improve website performance</li>
              <li>Remember your preferences</li>
              <li>
                Provide relevant marketing or advertising where applicable
              </li>
            </ul>

            <p>
              You may be able to disable cookies through your browser
              settings. However, disabling certain cookies may affect the
              functionality of our website.
            </p>

            {/* 5 */}
            <h3>5. THIRD-PARTY SERVICES</h3>

            <p>
              BZAK may use trusted third-party service providers to help
              operate our online store, including:
            </p>

            <ul>
              <li>Payment processing services</li>
              <li>Courier and delivery companies</li>
              <li>Website hosting providers</li>
              <li>Website analytics services</li>
              <li>Email and communication services</li>
              <li>Marketing and advertising platforms</li>
              <li>Technical and security service providers</li>
            </ul>

            <p>
              These third parties may receive limited information necessary
              to provide their services.
            </p>

            <p>
              <strong>BZAK does not sell your personal information to third parties.</strong>
            </p>

            {/* 6 */}
            <h3>6. MARKETING COMMUNICATIONS</h3>

            <p>
              If you provide your email address or phone number, we may use it
              to contact you regarding your orders, products, promotions,
              special offers, or other BZAK updates, where permitted by
              applicable law.
            </p>

            <p>
              You may request to stop receiving promotional communications at
              any time by contacting us or using the unsubscribe option
              provided in applicable marketing messages.
            </p>

            <p>
              Please note that you may still receive important transactional
              communications, such as order confirmations, delivery updates,
              or information regarding your account.
            </p>

            {/* 7 */}
            <h3>7. HOW WE PROTECT YOUR INFORMATION</h3>

            <p>
              BZAK takes reasonable administrative, technical, and
              organizational measures to protect your personal information
              against unauthorized access, misuse, loss, alteration,
              disclosure, or destruction.
            </p>

            <p>
              However, no method of transmitting or storing information online
              can be guaranteed to be completely secure.
            </p>

            <p>
              The security of your information is important to us, and we
              continuously seek to maintain appropriate safeguards for the
              information we handle.
            </p>

            {/* 8 */}
            <h3>8. HOW LONG WE KEEP YOUR INFORMATION</h3>

            <p>
              We retain personal information only for as long as reasonably
              necessary for the purposes described in this Privacy Policy,
              including:
            </p>

            <ul>
              <li>Completing and maintaining records of your orders</li>
              <li>Providing customer support</li>
              <li>Managing returns and refunds</li>
              <li>Maintaining business and financial records</li>
              <li>Resolving disputes</li>
              <li>Preventing fraud and misuse</li>
              <li>Complying with applicable legal obligations</li>
            </ul>

            <p>
              When information is no longer reasonably required, we may
              securely delete, anonymize, or otherwise dispose of it where
              appropriate.
            </p>

            {/* 9 */}
            <h3>9. YOUR PRIVACY RIGHTS</h3>

            <p>Depending on applicable law, you may have the right to:</p>

            <ul>
              <li>Ask what personal information we hold about you</li>
              <li>
                Request correction of inaccurate or incomplete information
              </li>
              <li>Request deletion of certain personal information</li>
              <li>
                Withdraw consent where processing is based on consent
              </li>
              <li>Opt out of promotional communications</li>
              <li>
                Ask questions about how your information is collected or used
              </li>
            </ul>

            <p>
              To make a privacy-related request, please contact BZAK using the
              contact information provided below.
            </p>

            <p>
              We may need to verify your identity before completing certain
              requests in order to protect your account and personal
              information.
            </p>

            {/* 10 */}
            <h3>10. CHILDREN'S PRIVACY</h3>

            <p>
              Our website is intended for general consumers and is not
              specifically directed toward children.
            </p>

            <p>
              We do not knowingly collect personal information from children
              where such collection is prohibited by applicable law.
            </p>

            <p>
              If you believe that a child has provided personal information to
              us without appropriate authorization, please contact us so that
              we can review and take appropriate action.
            </p>

            {/* 11 */}
            <h3>11. LINKS TO OTHER WEBSITES</h3>

            <p>
              Our website may contain links to third-party websites, including
              payment services, social media platforms, courier services, or
              other websites.
            </p>

            <p>
              BZAK is not responsible for the privacy practices, security, or
              content of third-party websites.
            </p>

            <p>
              We recommend reviewing the privacy policy of any third-party
              website before providing personal information.
            </p>

            {/* 12 */}
            <h3>12. CHANGES TO THIS PRIVACY POLICY</h3>

            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our business, website, services, technology, or
              applicable legal requirements.
            </p>

            <p>
              When we make changes, we will update the Effective Date at the
              top of this page.
            </p>

            <p>
              We encourage you to review this Privacy Policy periodically to
              remain informed about how BZAK handles personal information.
            </p>

            {/* 13 */}
            <h3>13. CONTACT US</h3>

            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or the way BZAK handles your personal information,
              please contact us:
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
                <a href="tel:+923157724828">0315-7724828</a>
              </p>

              <p>
                <strong>Address:</strong> Multan, Pakistan
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

export default PrivacyPolicy;