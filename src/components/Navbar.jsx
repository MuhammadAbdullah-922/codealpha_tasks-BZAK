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

  const topLinks = [
    { label: "Home", to: "/" },
   
    { label: "Shop", to: "/shop" },
    { label: "About us", to: "/About" },
    { label: "Products", to: "/shop" },
     { label: "Contact us", to: "/Contact" },
    
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

          {/* DESKTOP MENU (UNCHANGED) */}
          <nav className="bzak-toplinks">
            {topLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                className="bzak-toplink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          

          <a href="tel:+923157724828" className="bzak-phone">
            <FaPhoneAlt className="me-2" />
            +923157724828
          </a>

        </div>
      </div>

      {/* MAIN BAR */}
      <div className="bzak-mainbar">
        <div className="container bzak-mainbar-inner">

          {/* LOGO */}
          <Link to="/" className="bzak-logo">
            <img src={logo} alt="B-ZAK" className="bzak-logo-img" />
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
              className="bzak-icon-link d-none d-sm-flex"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <FaUser />
              <span>MY Account</span>
            </button>

            <Link to="/wishlist" className="bzak-icon-link bzak-wishlist d-none d-sm-flex">
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
        {topLinks.map((l) => (
          <Link
            key={l.label}
            to={l.to}
            onClick={() => setMenuOpen(false)}
            className="bzak-mobile-link"
          >
            {l.label}
          </Link>
        ))}
      </div>

    </header>
  );
};

export default Navbar;