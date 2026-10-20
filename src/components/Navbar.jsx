import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBars,
  FaTimes,
  FaPhoneAlt,
  FaSearch,
  FaUser,
  FaHeart,
  FaShoppingCart,
  FaChevronDown,
  FaHome,
  FaStore,
  FaLayerGroup,
  FaInfoCircle,
  FaEnvelope,
  FaTruck,
} from "react-icons/fa";
import "../styles/Navbar.css";
import logo from "../assets/logo.jpeg";
import { getCategories, extractList } from "../services/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("All Categories");
  const [catOpen, setCatOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // controls the "Collection" dropdown (desktop) visibility
  const [productsOpen, setProductsOpen] = useState(false);
  // controls the "Collection" submenu inside the mobile dropdown
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    getCategories()
      .then((res) => {
        setCategories(extractList(res));
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // sub-links shown inside the Collection dropdown
  // NOTE: `to` paths are UNCHANGED — only the visible label/text differs.
  const productLinks = [
    { label: "Winter Collection", to: "/mens-winter-collection" },
    { label: "Imported", to: "/new_collections" },
  ];

  const topLinks = [
    { label: "Home", to: "/", icon: <FaHome /> },

    { label: "Shop", to: "/shop", icon: <FaStore /> },
    { label: "About us", to: "/About", icon: <FaInfoCircle /> },
    // "Collection" is rendered separately as a dropdown (see idx === 1 below)
    { label: "Contact us", to: "/Contact", icon: <FaEnvelope /> },
  ];

  // Builds /shop?search=...&category=... and navigates there
  const runSearch = () => {
    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }
    if (category && category !== "All Categories") {
      params.set("category", category);
    }

    const query = params.toString();
    navigate(query ? `/shop?${query}` : "/shop");
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      runSearch();
    }
  };
  const handleAccount = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      navigate("/my-account");
    }
  };

  return (
    <header className="bzak-header">
      {/* TOP BAR */}
      <div className="bzak-topbar">
        <div className="container bzak-topbar-inner">
          {/* HAMBURGER (MOBILE ONLY) */}
          <button
            className="bzak-hamburger d-lg-none"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* DESKTOP MENU */}
          <nav className="bzak-toplinks">
            {topLinks.map((l, idx) => (
              <React.Fragment key={l.label}>
                <Link to={l.to} className="bzak-toplink">
                  {l.label}
                </Link>

                {/* Insert "Collection" dropdown right after "About us" (index 1) */}
                {idx === 1 && (
                  <div
                    className="bzak-products-dropdown"
                    onMouseEnter={() => setProductsOpen(true)}
                    onMouseLeave={() => setProductsOpen(false)}
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <button
                      type="button"
                      className="bzak-toplink"
                      onClick={() => setProductsOpen((prev) => !prev)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      Collection <FaChevronDown size={10} />
                    </button>

                    {productsOpen && (
                      <ul
                        className="bzak-products-dropdown-menu"
                        style={{
                          position: "absolute",
                          top: "100%",
                          left: 0,
                          background: "#fff",
                          listStyle: "none",
                          margin: 0,
                          padding: "8px 0",
                          minWidth: "220px",
                          boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                          borderRadius: "4px",
                          zIndex: 1000,
                        }}
                      >
                        {productLinks.map((p) => (
                          <li key={p.label}>
                            <Link
                              to={p.to}
                              onClick={() => setProductsOpen(false)}
                              className="bzak-dropdown-link"
                              style={{
                                display: "block",
                                padding: "8px 16px",
                                color: "#333",
                                textDecoration: "none",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* COD BADGE + PHONE */}
          <div className="bzak-topbar-right">
            <div className="bzak-cod-badge">
              <FaTruck className="bzak-cod-badge__icon" />
              <span className="bzak-cod-badge__text">
                COD Available <strong>All Over the Pakistan</strong>
              </span>
            </div>

            <a href="tel:+923157724828" className="bzak-phone">
              <FaPhoneAlt className="me-2" />
              +923157724828
            </a>
          </div>
        </div>
      </div>

      {/* MAIN BAR */}
      <div className="bzak-mainbar">
        <div className="container bzak-mainbar-inner">
          {/* LOGO */}
          <Link to="/" className="bzak-logo">
            <img src={logo} alt="B-ZAK" className="bzak-logo-img" />
            <span className="bzak-logo-tagline">
              Modern <span className="bzak-logo-tagline__dot">|</span> Bold{" "}
              <span className="bzak-logo-tagline__dot">|</span> Fit
            </span>
          </Link>

          {/* SEARCH (DESKTOP ONLY) */}
          <div className="bzak-search d-none d-md-flex">
            <div className="bzak-search-cat">
              <button
                className="bzak-search-cat-btn"
                onClick={() => setCatOpen(!catOpen)}
              >
                {category} <FaChevronDown size={11} />
              </button>

              {catOpen && (
                <ul className="bzak-cat-dropdown open">
                  <li
                    onClick={() => {
                      setCategory("All Categories");
                      setCatOpen(false);
                    }}
                  >
                    All Categories
                  </li>
                  {categories.map((c) => (
                    <li
                      key={c.id || c.slug || c.name}
                      onClick={() => {
                        setCategory(c.name);
                        setCatOpen(false);
                      }}
                    >
                      {c.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              type="text"
              className="bzak-search-input"
              placeholder="Search for items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />

            <button className="bzak-search-btn" onClick={runSearch}>
              <FaSearch />
            </button>
          </div>

          {/* ICONS */}
          <div className="bzak-icons">
            <button
              type="button"
              onClick={handleAccount}
              className="bzak-icon-link"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <FaUser />
              <span>MY Account</span>
            </button>

            <Link to="/wishlist" className="bzak-icon-link bzak-wishlist">
              <FaHeart />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bzak-wishlist-badge">{wishlistCount}</span>
              )}
            </Link>

            <Link to="/cart" className="bzak-icon-link bzak-cart">
              <FaShoppingCart />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bzak-cart-badge">{cartCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      <div className={`bzak-mobile-menu ${menuOpen ? "open" : ""}`}>
        {topLinks.map((l, idx) => (
          <React.Fragment key={l.label}>
            <Link
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className="bzak-mobile-link"
            >
              <span className="bzak-mobile-link__icon">{l.icon}</span>
              <span className="bzak-mobile-link__text">{l.label}</span>
            </Link>

            {/* Collection submenu inside mobile menu, after "About us" */}
            {idx === 1 && (
              <>
                <button
                  type="button"
                  className="bzak-mobile-link bzak-mobile-link--btn"
                  onClick={() => setMobileProductsOpen((prev) => !prev)}
                >
                  <span className="bzak-mobile-link__icon">
                    <FaLayerGroup />
                  </span>
                  <span className="bzak-mobile-link__text">Collection</span>
                  <FaChevronDown
                    size={11}
                    className="bzak-mobile-link__chevron"
                    style={{
                      transform: mobileProductsOpen ? "rotate(180deg)" : "none",
                    }}
                  />
                </button>

                {mobileProductsOpen &&
                  productLinks.map((p) => (
                    <Link
                      key={p.label}
                      to={p.to}
                      onClick={() => {
                        setMenuOpen(false);
                        setMobileProductsOpen(false);
                      }}
                      className="bzak-mobile-link bzak-mobile-sublink"
                    >
                      {p.label}
                    </Link>
                  ))}
              </>
            )}
          </React.Fragment>
        ))}

        {/* COD badge also shown in mobile menu */}
        <div className="bzak-mobile-cod-badge">
          <FaTruck className="bzak-cod-badge__icon" />
          <span>
            COD Available <strong>All Over the Pakistan</strong>
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;