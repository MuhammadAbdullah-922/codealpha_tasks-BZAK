import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getImageUrl, getCategories, getProduct, addReview, extractList } from "../services/api";
import "../styles/Product_details.css";

/* ---------- small inline icons (no extra dependency) ---------- */
const StarIcon = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#facc15" : "none"}>
    <path
      d="M12 2.5l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.6 5.8 20.8l1.6-6.8-5.2-4.6 6.9-.6L12 2.5Z"
      stroke="#facc15"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "#ef4444" : "none"}>
    <path
      d="M12 21s-7.5-4.6-10-9.1C.4 8.2 2 4.5 5.6 4c2.2-.3 4.1 1 6.4 3.4C14.3 5 16.2 3.7 18.4 4c3.6.5 5.2 4.2 3.6 7.9C19.5 16.4 12 21 12 21Z"
      stroke="#6b7280"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);
const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"
      stroke="#6b7280"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="#6b7280" strokeWidth="1.5" />
  </svg>
);
const MinusIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 2" fill="none">
    <path d="M0 1H10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const PlusIcon = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
    <path d="M5 0V10M0 5H10" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

/* ---------- helpers ---------- */

// products store their picture(s) in an `images` column that can be a
// plain string, an array, or a JSON string. Returns the full list.
const productImages = (product) => {
  const raw = product?.images ?? product?.image;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [raw];
    } catch {
      return [raw];
    }
  }
  return [];
};

const formatPrice = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const avgRating = (reviews = []) =>
  reviews.length ? reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviews.length : 0;

// Static sidebar options — the design's "Weight" / "Color" / "Tags" filters
// aren't backed by real DB columns yet (see note at the bottom of the chat).
const WEIGHT_OPTIONS = ["2kg Pack", "20kg Pack", "30kg Pack"];
const COLOR_OPTIONS = [
  { name: "Blue", hex: "#3b82f6" },
  { name: "Yellow", hex: "#facc15" },
  { name: "Red", hex: "#ef4444" },
  { name: "Green", hex: "#22c55e" },
];
const TAG_OPTIONS = ["Vegetables", "Juice", "Food", "Dry Fruits"];

export default function Product_details() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [priceRange, setPriceRange] = useState(250);

  const [activeImage, setActiveImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const [reviewsList, setReviewsList] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await getProduct(slug);
        if (!isMounted) return;
        const p = res.data.product;
        setProduct(p);
        setError(null);
        setReviewsList(p.reviews || []);

        const imgs = productImages(p);
        setActiveImage(imgs[0] || null);

        if (Array.isArray(p.sizes) && p.sizes.length) {
          setSelectedSize(p.sizes[0]);
        }
      } catch {
        if (isMounted) setError("This product couldn't be found.");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCategories();
        setCategories(extractList(res));
      } catch {
        // sidebar categories are non-critical — fail silently
      }
    })();
  }, []);

  const handleAddToCart = async () => {
    if (!product || adding) return;
    setAdding(true);
    try {
      await addToCart(product.id, quantity, selectedSize ? { size: selectedSize } : {});
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch {
      // CartContext already surfaces errors elsewhere
    } finally {
      setAdding(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!product || reviewSubmitting) return;

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewError("Please write a comment before submitting.");
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const res = await addReview(product.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      const newReview = res.data.review || res.data;
      setReviewsList((prev) => [newReview, ...prev]);
      setReviewComment("");
      setReviewRating(5);
    } catch {
      setReviewError("Couldn't submit your review — please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pd-page">
          <p className="pd-state">Loading product…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <main className="pd-page">
          <p className="pd-state pd-state--error">{error || "Product not found."}</p>
        </main>
        <Footer />
      </>
    );
  }

  const images = productImages(product);
  const reviews = reviewsList;
  const rating = avgRating(reviews);
  const hasSale =
    product.sale_price !== null &&
    product.sale_price !== undefined &&
    Number(product.sale_price) < Number(product.price);

  return (
    <>
      <Navbar />

      <main className="pd-page">
        <div className="pd-layout">
          {/* ---------------- Sidebar filters ---------------- */}
          <aside className="pd-sidebar">
            <div className="pd-filter-block">
              <h3 className="pd-filter-title">Product Category</h3>
              <ul className="pd-checkbox-list">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedCategory === cat.slug}
                        onChange={() =>
                          setSelectedCategory((prev) => (prev === cat.slug ? null : cat.slug))
                        }
                      />
                      <span>{cat.name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pd-filter-block">
              <h3 className="pd-filter-title">Filter By Price</h3>
              <input
                type="range"
                min="20"
                max="250"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="pd-range"
              />
              <p className="pd-range-label">Price : Rs 20 - Rs {priceRange}</p>
              <button
                type="button"
                className="pd-filter-btn"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set("min_price", "20");
                  params.set("max_price", String(priceRange));
                  if (selectedCategory) params.set("category", selectedCategory);
                  navigate(`/shop?${params.toString()}`);
                }}
              >
                Filter
              </button>
            </div>

            <div className="pd-filter-block">
              <h3 className="pd-filter-title">Filter By Color</h3>
              <ul className="pd-checkbox-list">
                {COLOR_OPTIONS.map((c) => (
                  <li key={c.name}>
                    <label>
                      <input type="checkbox" />
                      <span>{c.name}</span>
                      <i className="pd-color-dot" style={{ background: c.hex }} />
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pd-filter-block">
              <h3 className="pd-filter-title">Weight</h3>
              <ul className="pd-checkbox-list">
                {WEIGHT_OPTIONS.map((w) => (
                  <li key={w}>
                    <label>
                      <input type="checkbox" />
                      <span>{w}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pd-filter-block">
              <h3 className="pd-filter-title">Products Tags</h3>
              <div className="pd-tags">
                {TAG_OPTIONS.map((tag) => (
                  <Link key={tag} to={`/shop?tag=${tag}`} className="pd-tag">
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* ---------------- Main product panel ---------------- */}
          <section className="pd-main">
            <div className="pd-top">
              <div className="pd-gallery">
                <div className="pd-gallery__main">
                  {activeImage ? (
                    <img src={getImageUrl(activeImage)} alt={product.name} />
                  ) : (
                    <div className="pd-gallery__placeholder" />
                  )}
                </div>
                {images.length > 1 && (
                  <div className="pd-gallery__thumbs">
                    {images.map((img) => (
                      <button
                        key={img}
                        type="button"
                        className={`pd-gallery__thumb ${activeImage === img ? "is-active" : ""}`}
                        onClick={() => setActiveImage(img)}
                      >
                        <img src={getImageUrl(img)} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="pd-info">
                <h1 className="pd-info__title">{product.name}</h1>
                {product.short_description && (
                  <p className="pd-info__desc">{product.short_description}</p>
                )}

                <div className="pd-info__rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < Math.round(rating)} />
                  ))}
                  <span className="pd-info__review-count">
                    ({reviews.length} Review{reviews.length === 1 ? "" : "s"})
                  </span>
                </div>

                <dl className="pd-specs">
                  {product.brand && (
                    <div className="pd-specs__row">
                      <dt>Brand</dt>
                      <dd>{product.brand}</dd>
                    </div>
                  )}
                  {product.flavour && (
                    <div className="pd-specs__row">
                      <dt>Flavour</dt>
                      <dd>{product.flavour}</dd>
                    </div>
                  )}
                  {product.diet_type && (
                    <div className="pd-specs__row">
                      <dt>Diet Type</dt>
                      <dd>{product.diet_type}</dd>
                    </div>
                  )}
                  {product.weight && (
                    <div className="pd-specs__row">
                      <dt>Weight</dt>
                      <dd>{product.weight}</dd>
                    </div>
                  )}
                  {product.speciality && (
                    <div className="pd-specs__row">
                      <dt>Speciality</dt>
                      <dd>{product.speciality}</dd>
                    </div>
                  )}
                  {product.info && (
                    <div className="pd-specs__row">
                      <dt>Info</dt>
                      <dd>{product.info}</dd>
                    </div>
                  )}
                  <div className="pd-specs__row">
                    <dt>SKU</dt>
                    <dd>{product.sku}</dd>
                  </div>
                </dl>

                <div className="pd-price-row">
                  {hasSale ? (
                    <>
                      <span className="pd-price pd-price--sale">
                        {formatPrice(product.sale_price)}
                      </span>
                      <span className="pd-price pd-price--old">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="pd-price">{formatPrice(product.price)}</span>
                  )}
                </div>

                {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                  <div className="pd-size-row">
                    <span className="pd-size-row__label">Size/Weight :</span>
                    <div className="pd-size-options">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          className={`pd-size-btn ${selectedSize === size ? "is-active" : ""}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pd-action-row">
                  <div className="qty-stepper">
                    <button
                      type="button"
                      className="qty-stepper__btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <MinusIcon />
                    </button>
                    <span className="qty-stepper__value">{quantity}</span>
                    <button
                      type="button"
                      className="qty-stepper__btn"
                      onClick={() => setQuantity((q) => q + 1)}
                      aria-label="Increase quantity"
                    >
                      <PlusIcon />
                    </button>
                  </div>

                  <button
                    type="button"
                    className={`pd-add-btn ${justAdded ? "is-added" : ""}`}
                    onClick={handleAddToCart}
                    disabled={adding}
                  >
                    {adding ? "Adding…" : justAdded ? "Added ✓" : "Add To Cart"}
                  </button>

                  <button
                    type="button"
                    className="pd-icon-btn"
                    aria-label="Add to wishlist"
                    onClick={() => setWishlisted((w) => !w)}
                  >
                    <HeartIcon filled={wishlisted} />
                  </button>

                  <button type="button" className="pd-icon-btn" aria-label="Quick view">
                    <EyeIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* ---------------- Tabs ---------------- */}
            <div className="pd-tabs">
              <div className="pd-tabs__nav">
                <button
                  type="button"
                  className={`pd-tabs__btn ${activeTab === "description" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("description")}
                >
                  Description
                </button>
                <button
                  type="button"
                  className={`pd-tabs__btn ${activeTab === "information" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("information")}
                >
                  Information
                </button>
                <button
                  type="button"
                  className={`pd-tabs__btn ${activeTab === "review" ? "is-active" : ""}`}
                  onClick={() => setActiveTab("review")}
                >
                  Review
                </button>
              </div>

              <div className="pd-tabs__content">
                {activeTab === "description" && (
                  <p>{product.description || "No description available for this product yet."}</p>
                )}

                {activeTab === "information" && (
                  <table className="pd-info-table">
                    <tbody>
                      <tr>
                        <td>SKU</td>
                        <td>{product.sku}</td>
                      </tr>
                      <tr>
                        <td>Category</td>
                        <td>{product.category?.name || "—"}</td>
                      </tr>
                      {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                        <tr>
                          <td>Available Sizes</td>
                          <td>{product.sizes.join(", ")}</td>
                        </tr>
                      )}
                      {Array.isArray(product.colors) && product.colors.length > 0 && (
                        <tr>
                          <td>Available Colors</td>
                          <td>{product.colors.join(", ")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}

                {activeTab === "review" && (
                  <div className="pd-reviews">
                    <form className="pd-review-form" onSubmit={handleSubmitReview}>
                      <h4>Write a Review</h4>

                      <div className="pd-review-form__stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            className="pd-review-form__star-btn"
                            onClick={() => setReviewRating(i + 1)}
                            aria-label={`Rate ${i + 1} out of 5`}
                          >
                            <StarIcon filled={i < reviewRating} />
                          </button>
                        ))}
                      </div>

                      <textarea
                        className="pd-review-form__textarea"
                        placeholder="Share your thoughts about this product…"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                      />

                      {reviewError && <p className="pd-review-form__error">{reviewError}</p>}

                      <button
                        type="submit"
                        className="pd-review-form__submit"
                        disabled={reviewSubmitting}
                      >
                        {reviewSubmitting ? "Submitting…" : "Submit Review"}
                      </button>
                    </form>

                    {reviews.length === 0 && (
                      <p className="pd-reviews__empty">No reviews yet for this product.</p>
                    )}
                    {reviews.map((r) => (
                      <div className="pd-review" key={r.id}>
                        <div className="pd-review__stars">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon key={i} filled={i < r.rating} />
                          ))}
                        </div>
                        <p className="pd-review__author">{r.user?.name || "Anonymous"}</p>
                        <p className="pd-review__comment">{r.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ---------------- Packaging & Delivery ---------------- */}
            <div className="pd-packaging">
              <h3>Packaging &amp; Delivery</h3>
              <p>
                Every order is carefully packed to keep it fresh in transit, and shipped
                within 1–2 business days. Delivery time depends on your location and is
                shown at checkout before you place the order.
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}