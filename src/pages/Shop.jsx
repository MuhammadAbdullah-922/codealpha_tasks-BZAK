import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useSearchParams } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { getProducts, getImageUrl, extractList } from "../services/api";
import "../styles/Shop.css";


// PKR formatter — "Rs 82,000" style, no decimals. Same helper used in Cart.jsx,
// kept here too so Shop.jsx doesn't depend on that file.
const formatPrice = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

// Handles every shape the API might send back for an item's picture:
//   item.image  -> plain string
//   item.images -> array, e.g. ["products/pic5.jpeg"]
//   item.images -> JSON string, e.g. '["products/pic5.jpeg"]'
const firstImage = (item) => {
  const raw = item?.images ?? item?.image;
  if (!raw) return null;

  if (Array.isArray(raw)) return raw[0] || null;

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed[0] || null;
      return raw;
    } catch {
      return raw;
    }
  }

  return null;
};

// Maps the UI's sort labels to the backend's ProductController@index contract,
// which expects a single `sort` param: 'price_low' | 'price_high' | 'newest'.
const sortParams = (sort) => {
  switch (sort) {
    case "price-low":
      return { sort: "price_low" };
    case "price-high":
      return { sort: "price_high" };
    case "newest":
      return { sort: "newest" };
    case "popular":
    default:
      // Backend defaults to latest() when no/unknown sort is sent — that's fine.
      return {};
  }
};

// Turns a slug like "t-shirts" into a readable label "T Shirts" —
// used only as a fallback heading until the real category name loads.
const labelFromSlug = (slug) =>
  slug
    ? slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

const Shop = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isWished, toggleWishlist } = useWishlist();

  const [addingId, setAddingId] = useState(null);
  const [wishBusyId, setWishBusyId] = useState(null);

  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const categorySlug = searchParams.get("category") || "";

  const [sort, setSort] = useState("popular");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Small toast instead of alert() — auto-dismisses
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(false);

    const params = {
      per_page: 24,
      ...sortParams(sort),
      ...(searchTerm ? { search: searchTerm } : {}),
      ...(categorySlug ? { category: categorySlug } : {}),
    };

    getProducts(params)
      .then((res) => {
        if (!isMounted) return;
        setProducts(extractList(res));
      })
      .catch(() => isMounted && setError(true))
      .finally(() => isMounted && setLoading(false));

    return () => {
      isMounted = false;
    };
  }, [sort, searchTerm, categorySlug]);

  // Naya category select hote hi user ko page ke top par le aayein,
  // taake footer se click karne par woh turant naya result dekh sake.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categorySlug]);

  const handleAddToCart = async (productId) => {
    if (!productId) return;

    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/login";
      return;
    }

    setAddingId(productId);

    try {
      await addToCart(productId, 1);
    } catch (err) {
      console.log(err);
    } finally {
      setAddingId(null);
    }
  };

  // ---------- Wishlist toggle (via shared context) ----------
  const handleToggleWishlist = async (product) => {
    if (!product?.id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to use wishlist", "error");
      navigate("/login");
      return;
    }

    setWishBusyId(product.id);
    try {
      const { added } = await toggleWishlist(product.id);
      showToast(added ? "Added to wishlist ❤" : "Removed from wishlist");
    } catch (err) {
      console.log(err);
      if (err?.code === "not_authenticated" || err?.response?.status === 401) {
        showToast("Please login to use wishlist", "error");
        navigate("/login");
      } else {
        showToast("Something went wrong, try again", "error");
      }
    } finally {
      setWishBusyId(null);
    }
  };

  const categoryLabel = labelFromSlug(categorySlug);

  return (
    <>
      <Helmet>
        <title>
          {categoryLabel ? `${categoryLabel} | B-ZAK` : "Shop | B-ZAK Premium Streetwear"}
        </title>
        <meta
          name="description"
          content="Browse the full B-ZAK collection — tees, polos, shorts, and track pants. Premium streetwear built for style and comfort."
        />
      </Helmet>

      {/* Toast */}
      {toast && (
        <div className={`bzak-toast bzak-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      <section className="bzak-shop-header">
        <div className="container">
          <h1>{categoryLabel ? categoryLabel : "Shop All Products"}</h1>
          <p>Home / Shop{categoryLabel ? ` / ${categoryLabel}` : ""}</p>
        </div>
      </section>

      <section className="bzak-shop-section">
        <div className="container">
          <div className="bzak-shop-toolbar">
            <span className="bzak-shop-count">
              {loading
                ? "Loading…"
                : searchTerm
                ? `${products.length} results for "${searchTerm}"`
                : categoryLabel
                ? `${products.length} products in ${categoryLabel}`
                : `${products.length} products`}
            </span>
            <select
              className="bzak-shop-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="popular">Sort by: Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {loading && <div className="bzak-loading-note">Loading products…</div>}
          {!loading && error && (
            <div className="bzak-loading-note">Couldn't load products.</div>
          )}
          {!loading && !error && products.length === 0 && (
            <div className="bzak-loading-note">
              {categoryLabel
                ? `No products found in "${categoryLabel}".`
                : "No products found."}
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="row g-3">
              {products.map((p) => {
                const isWishedNow = isWished(p.id);
                const isBusy = wishBusyId === p.id;
                return (
                  <div className="col-6 col-sm-4 col-lg-3" key={p.id || p.slug || p.name}>
                    <div className="bzak-shop-card">
                      <Link to={`/product/${p.slug}`} className="bzak-shop-card-link">
                        <div className="bzak-shop-media">
                          {firstImage(p) && (
                            <img
                              src={getImageUrl(firstImage(p))}
                              alt={p.name}
                              loading="lazy"
                            />
                          )}
                          <button
                            type="button"
                            className={`bzak-shop-wish${isWishedNow ? " active" : ""}`}
                            aria-label={
                              isWishedNow ? "Remove from wishlist" : "Add to wishlist"
                            }
                            aria-pressed={isWishedNow}
                            disabled={isBusy}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleWishlist(p);
                            }}
                          >
                            <FaHeart />
                          </button>
                        </div>
                        <p className="bzak-shop-name">{p.name}</p>
                      </Link>
                      <div className="bzak-shop-price">
                        <span className="new">{formatPrice(p.price)}</span>
                        {p.old_price && (
                          <span className="old">{formatPrice(p.old_price)}</span>
                        )}
                      </div>
                      <button
                        className="bzak-shop-add"
                        onClick={() => handleAddToCart(p.id)}
                        disabled={addingId === p.id}
                      >
                        <FaShoppingCart className="me-2" />
                        {addingId === p.id ? "Adding..." : "Add To Cart"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Shop;