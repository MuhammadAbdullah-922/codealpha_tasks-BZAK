import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getImageUrl, getFeaturedProducts, extractList } from "../services/api";
import "../styles/Cart.css";

// Small inline icons — no extra dependency needed
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
const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
const StarIcon = ({ filled }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill={filled ? "#facc15" : "none"}>
    <path
      d="M12 2.5l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.6 5.8 20.8l1.6-6.8-5.2-4.6 6.9-.6L12 2.5Z"
      stroke="#facc15"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

// Same logic as Home.jsx's firstImage() — products store their picture(s)
// in an `images` column that can be a plain string, an array, or a JSON string.
const firstImage = (product) => {
  const raw = product?.images ?? product?.image;
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

// PKR formatter — "Rs 82,000" style, no decimals (matches how prices are quoted locally).
// Change currency/locale here if you ever need a different market.
const formatPrice = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function Cart() {
  const { cartItems, loading, error, updateQuantity, removeItem, cartTotal, addToCart } = useCart();
  const navigate = useNavigate();

  // ---- Popular Products (built inline right here, no separate component file) ----
  const [popularProducts, setPopularProducts] = useState([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [popularError, setPopularError] = useState(null);
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        setPopularLoading(true);
        const res = await getFeaturedProducts();
        if (isMounted) {
          setPopularProducts(extractList(res));
          setPopularError(null);
        }
      } catch {
        if (isMounted) setPopularError("Couldn't load popular products right now.");
      } finally {
        if (isMounted) setPopularLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    if (addingId) return;
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
    } catch {
      // errors are already surfaced by CartContext
    } finally {
      setAddingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <h1 className="cart-page__title">Your Cart</h1>

        {loading && <p className="cart-state">Loading your cart…</p>}

        {!loading && error && <p className="cart-state cart-state--error">{error}</p>}

        {!loading && !error && cartItems.length === 0 && (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
            <Link to="/products" className="cart-empty__link">
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-table-wrap">
            <table className="cart-table">
              <thead>
                <tr>
                  <th className="col-product">Product</th>
                  <th className="col-price">Price</th>
                  <th className="col-qty">Quantity</th>
                  <th className="col-total">Total</th>
                  <th className="col-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => {
                  const img = firstImage(item.product);
                  return (
                    <tr key={item.id}>
                      <td className="col-product">
                        <div className="cart-product">
                          {img && (
                            <img
                              src={getImageUrl(img)}
                              alt={item.product.name}
                              className="cart-product__img"
                            />
                          )}
                          <span className="cart-product__name">{item.product.name}</span>
                        </div>
                      </td>

                      <td className="col-price">{formatPrice(item.price)}</td>

                      <td className="col-qty">
                        <div className="qty-stepper">
                          <button
                            type="button"
                            className="qty-stepper__btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <MinusIcon />
                          </button>
                          <span className="qty-stepper__value">{item.quantity}</span>
                          <button
                            type="button"
                            className="qty-stepper__btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <PlusIcon />
                          </button>
                        </div>
                      </td>

                      <td className="col-total">
                        {formatPrice(item.price * item.quantity)}
                      </td>

                      <td className="col-action">
                        <button
                          type="button"
                          className="cart-remove-btn"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="cart-footer-row">
              <Link to="/products" className="cart-continue-link">
                Continue Shopping
              </Link>

              <div className="cart-footer-row__right">
                <span className="cart-subtotal">
                  Subtotal: <strong>{formatPrice(cartTotal)}</strong>
                </span>
                <button
                  type="button"
                  className="cart-checkout-btn"
                  onClick={() => navigate("/checkout")}
                >
                  Check Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ---- Popular Products — right after the checkout row, before Footer ---- */}
        <section className="popular-products">
          <div className="popular-products__header">
            <h2 className="popular-products__title">Popular Products</h2>
            <p className="popular-products__subtitle">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
              tincidunt ut laoreet et dolore magna aliquam erat volutpat.
            </p>
          </div>

          {popularError && (
            <p className="popular-products__state popular-products__state--error">
              {popularError}
            </p>
          )}

          {!popularError && !popularLoading && popularProducts.length === 0 && (
            <p className="popular-products__state">No featured products yet.</p>
          )}

          <div className="popular-products__grid">
            {popularLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div className="pp-card pp-card--skeleton" key={i}>
                    <div className="pp-card__img pp-card__img--placeholder" />
                    <div className="pp-skeleton-line pp-skeleton-line--sm" />
                    <div className="pp-skeleton-line" />
                    <div className="pp-skeleton-line pp-skeleton-line--sm" />
                  </div>
                ))
              : popularProducts.map((product) => {
                  const img = firstImage(product);
                  const hasSale =
                    product.sale_price !== null &&
                    product.sale_price !== undefined &&
                    Number(product.sale_price) < Number(product.price);
                  const rating = product.average_rating;

                  return (
                    <Link
                      to={`/product/${product.slug}`}
                      className="pp-card"
                      key={product.id}
                    >
                      <div className="pp-card__img-wrap">
                        {img ? (
                          <img
                            src={getImageUrl(img)}
                            alt={product.name}
                            className="pp-card__img"
                            loading="lazy"
                          />
                        ) : (
                          <div className="pp-card__img pp-card__img--placeholder" />
                        )}

                        <button
                          type="button"
                          className="pp-card__add-btn"
                          onClick={(e) => handleAddToCart(e, product.id)}
                          disabled={addingId === product.id}
                        >
                          {addingId === product.id ? "Adding…" : "Add to Cart"}
                        </button>
                      </div>

                      {product.category?.name && (
                        <span className="pp-card__category">{product.category.name}</span>
                      )}

                      {rating ? (
                        <div className="pp-card__stars" aria-label={`${rating} out of 5`}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <StarIcon key={i} filled={i < Math.round(rating)} />
                          ))}
                        </div>
                      ) : null}

                      <h3 className="pp-card__name">{product.name}</h3>

                      <div className="pp-card__price-row">
                        {hasSale ? (
                          <>
                            <span className="pp-card__price pp-card__price--sale">
                              {formatPrice(product.sale_price)}
                            </span>
                            <span className="pp-card__price pp-card__price--old">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="pp-card__price">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}