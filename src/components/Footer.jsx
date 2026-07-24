import React, { useState, useEffect } from "react";
import {
  subscribeNewsletter,
  getFooterGallery,
  getCategories,
  extractList,
} from "../services/api";

import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaTwitter,
  FaPinterestP,
  FaInstagram,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaPaperPlane,
  FaTimes,
} from "react-icons/fa";
import "../styles/Footer.css";
import logo from "../assets/logo.jpeg";

// Backend base URL (bina /api ke) — images isi se serve hongi
const STORAGE_BASE_URL = "http://localhost/Laravel/bzack-backend/public/";

const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Delivery Information", to: "/contact" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Contact Us", to: "/contact" },
  { label: "Support Center", to: "/contact" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await getFooterGallery();
        // status active (1) images hi lein, aur sort_order ke hisab se sort karein
        const images = (res.data || [])
          .filter((item) => Number(item.status) === 1)
          .sort((a, b) => a.sort_order - b.sort_order);
        setGalleryImages(images);
      } catch (err) {
        console.error("Failed to load footer gallery:", err);
      } finally {
        setGalleryLoading(false);
      }
    };

    fetchGallery();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        const list = extractList(res).filter(
          (cat) => cat.is_active === true || Number(cat.is_active) === 1
        );
        setCategories(list);
      } catch (err) {
        console.error("Failed to load footer categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ESC key se lightbox close karne ke liye
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxImage(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    try {
      const res = await subscribeNewsletter(email);

      alert(res.data.message);
      setEmail("");
    } catch (err) {
      alert(err.response?.data?.message || "Subscription failed");
    }
  };

  return (
    <footer className="bzak-footer">
      <div className="container">
        <div className="row g-4">
          {/* Company info */}
          <div className="col-lg-4 col-md-6">
            <Link to="/" className="bzak-footer-logo">
              <img src={logo} alt="B-ZAK" className="bzak-footer-logo-img" />
            </Link>
            <p className="bzak-footer-desc">
              B-ZAK is a premium clothing brand offering stylish apparel,
              high-quality fabrics, and modern fashion designed for everyday confidence.
            </p>
            <div className="bzak-footer-contact">
              <p>
                <FaMapMarkerAlt />Street No. 15, House No.14 New Multan.
              </p>
              <p>
                <FaEnvelope /> Bzakapparel@gmail.com
              </p>
              <p>
                <FaPhoneAlt /> +923157724828
              </p>
            </div>
          </div>

          {/* Company links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="bzak-footer-heading">Company</h6>
            <ul className="bzak-footer-links">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Category links */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="bzak-footer-heading">Category</h6>
            <ul className="bzak-footer-links">
              {categoriesLoading && (
                <li className="bzak-footer-links-loading">Loading...</li>
              )}
              {!categoriesLoading && categories.length === 0 && (
                <li>
                  <Link to="/shop">Shop All</Link>
                </li>
              )}
              {!categoriesLoading &&
                categories.map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/shop?category=${cat.slug}`}>{cat.name}</Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Newsletter + social + gallery */}
          <div className="col-lg-4 col-md-6">
            <h6 className="bzak-footer-heading">Subscribe Our Newsletter</h6>
            <form
              className="bzak-footer-newsletter"
              onSubmit={handleSubscribe}
            >
              <input
                type="email"
                placeholder="Enter you Email.."
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button type="submit" aria-label="Subscribe">
                <FaPaperPlane />
              </button>
            </form>

            <div className="bzak-footer-social">
              <a href="https://facebook.com" target="_blank" rel="noreferrer">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <FaTwitter />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer">
                <FaPinterestP />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer">
                <FaInstagram />
              </a>
            </div>

            <div className="bzak-footer-gallery">
              {!galleryLoading &&
                galleryImages.map((img) => (
                  <img
                    key={img.id}
                    src={`${STORAGE_BASE_URL}${img.image}`}
                    alt={`Bzak gallery ${img.id}`}
                    loading="lazy"
                    className="bzak-gallery-img"
                    onClick={() =>
                      setLightboxImage(`${STORAGE_BASE_URL}${img.image}`)
                    }
                  />
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bzak-footer-bottom">
        <div className="container">
          &copy; {new Date().getFullYear()}{" "}
          <span>Bzak</span>. All rights reserved.
        </div>
      </div>

      {/* Lightbox: gallery image click par bara preview */}
      {lightboxImage && (
        <div
          className="bzak-lightbox-overlay"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="bzak-lightbox-close"
            aria-label="Close preview"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage(null);
            }}
          >
            <FaTimes />
          </button>
          <img
            src={lightboxImage}
            alt="Gallery preview"
            className="bzak-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </footer>
  );
};

export default Footer;