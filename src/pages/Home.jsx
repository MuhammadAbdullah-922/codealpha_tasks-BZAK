import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";
import { useCart } from "../context/CartContext";
import {
  FaHeart,
  FaStar,
  FaTruck,
  FaTags,
  FaGift,
  FaBoxOpen,
  FaUndo,
} from "react-icons/fa";
import {
  getCategories,
  getFeaturedProducts,
  getNewArrivals,
  getProducts,
  getImageUrl,
  extractList,
  getWishlist,
  addToWishlist,
  removeWishlistItem,
} from "../services/api";
import "../styles/Home.css";

const features = [
  { icon: <FaTags />, title: "Best prices & offers", desc: "Orders $50 or more" },
  { icon: <FaTruck />, title: "Free delivery", desc: "24/7 amazing services" },
  { icon: <FaGift />, title: "Great daily deal", desc: "When you sign up" },
  { icon: <FaBoxOpen />, title: "Wide assortment", desc: "Mega discounts" },
  { icon: <FaUndo />, title: "Easy returns", desc: "Within 30 days" },
];

const formatPrice = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

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

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  const [bestSells, setBestSells] = useState([]);
  const [bestSellsLoading, setBestSellsLoading] = useState(true);
  const [bestSellsError, setBestSellsError] = useState(false);

  const [styles, setStyles] = useState([]);
  const [stylesLoading, setStylesLoading] = useState(true);
  const [stylesError, setStylesError] = useState(false);

  const [deals, setDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(true);
  const [dealsError, setDealsError] = useState(false);

  const [addingId, setAddingId] = useState(null);

  // ---------- Wishlist state ----------
  // Maps product_id -> wishlist row id, so we know both
  // "is this product wishlisted" AND "which row to delete"
  const [wishlistMap, setWishlistMap] = useState({});
  const [wishBusyId, setWishBusyId] = useState(null);

  // Small toast instead of alert() — auto-dismisses
  const [toast, setToast] = useState(null);
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    let isMounted = true;

    getCategories()
      .then((res) => {
        if (!isMounted) return;
        setCategories(extractList(res));
      })
      .catch(() => isMounted && setCategoriesError(true))
      .finally(() => isMounted && setCategoriesLoading(false));

    getFeaturedProducts()
      .then((res) => {
        if (!isMounted) return;
        setBestSells(extractList(res));
      })
      .catch(() => isMounted && setBestSellsError(true))
      .finally(() => isMounted && setBestSellsLoading(false));

    getNewArrivals()
      .then((res) => {
        if (!isMounted) return;
        setStyles(extractList(res).slice(0, 3));
      })
      .catch(() => isMounted && setStylesError(true))
      .finally(() => isMounted && setStylesLoading(false));

    getProducts({ per_page: 4, page: 2 })
      .then((res) => {
        if (!isMounted) return;
        setDeals(extractList(res).slice(0, 4));
      })
      .catch(() => isMounted && setDealsError(true))
      .finally(() => isMounted && setDealsLoading(false));

    // Load current user's wishlist (only matters if logged in — if the
    // request 401s because there's no token, we just leave hearts empty)
    const token = localStorage.getItem("token");
    if (token) {
      getWishlist()
        .then((res) => {
          if (!isMounted) return;
          const items = res?.data?.wishlist || [];
          const map = {};
          items.forEach((item) => {
            if (item?.product?.id) map[item.product.id] = item.id;
          });
          setWishlistMap(map);
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = async (productId) => {
    if (!productId) return;

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setAddingId(productId);

    try {
      await addToCart(productId, 1);
    } catch (err) {
      console.log(err);

      if (err?.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setAddingId(null);
    }
  };

  // ---------- Wishlist toggle (backend-connected) ----------
  const handleToggleWishlist = async (product) => {
    if (!product?.id) return;

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to use wishlist", "error");
      navigate("/login");
      return;
    }

    const existingRowId = wishlistMap[product.id];
    setWishBusyId(product.id);

    try {
      if (existingRowId) {
        // already wishlisted -> remove
        await removeWishlistItem(existingRowId);
        setWishlistMap((prev) => {
          const next = { ...prev };
          delete next[product.id];
          return next;
        });
        showToast("Removed from wishlist");
      } else {
        // not wishlisted -> add
        const res = await addToWishlist(product.id);
        const newRowId = res?.data?.wishlist?.id || res?.data?.id;
        setWishlistMap((prev) => ({ ...prev, [product.id]: newRowId }));
        showToast("Added to wishlist ❤");
      }
    } catch (err) {
      console.log(err);
      if (err?.response?.status === 401) {
        navigate("/login");
      } else {
        showToast("Something went wrong, try again", "error");
      }
    } finally {
      setWishBusyId(null);
    }
  };

  return (
    <>
      <Helmet>
        <title>B-ZAK | Premium Streetwear & Everyday Essentials</title>
        <meta
          name="description"
          content="Shop premium tees, polos, hoodies, and track pants at B-ZAK. Style that defines you — fast delivery, great deals, wide assortment."
        />
        <meta
          name="keywords"
          content="B-ZAK, streetwear, mens clothing, polo shirts, hoodies, track pants, online clothing store"
        />
        <link rel="canonical" href="https://www.bzak.com/" />
      </Helmet>

      {/* Toast */}
      {toast && (
        <div className={`bzak-toast bzak-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      <HeroSlider />

      {/* Popular Categories */}
      <section className="bzak-section">
        <div className="container text-center">
          <p className="bzak-eyebrow">Customer Favorites</p>
          <h2 className="bzak-section-title">Popular Categories</h2>

          {categoriesLoading && (
            <div className="bzak-loading-note">Loading categories…</div>
          )}
          {!categoriesLoading && categoriesError && (
            <div className="bzak-loading-note">Couldn't load categories.</div>
          )}
          {!categoriesLoading && !categoriesError && categories.length === 0 && (
            <div className="bzak-loading-note">No categories found.</div>
          )}

          {!categoriesLoading && categories.length > 0 && (
            <div className="row g-3 mt-4">
              {categories.map((c) => (
                <div className="col-6 col-md-4 col-lg" key={c.id || c.slug || c.name}>
                  <Link to={`/shop?category=${c.slug}`} className="bzak-cat-card-link">
                    <div className="bzak-cat-card">
                      <div className="bzak-cat-img">
                        {firstImage(c) && (
                          <img src={getImageUrl(firstImage(c))} alt={c.name} loading="lazy" />
                        )}
                      </div>
                      <h6>{c.name}</h6>
                      {c.count != null && <span>({c.count})</span>}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bzak-section bzak-section-alt">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
            <h2 className="bzak-section-title mb-0">Best Sellers</h2>
            <div className="bzak-tabs">
              <span className="active">Featured</span>
              <span>Popular</span>
              <span>New added</span>
            </div>
          </div>

          {bestSellsLoading && (
            <div className="bzak-loading-note">Loading best sellers…</div>
          )}
          {!bestSellsLoading && bestSellsError && (
            <div className="bzak-loading-note">Couldn't load best sellers.</div>
          )}
          {!bestSellsLoading && !bestSellsError && bestSells.length === 0 && (
            <div className="bzak-loading-note">No products found.</div>
          )}

          {!bestSellsLoading && bestSells.length > 0 && (
            <div className="row g-3">
              <div className="col-lg-3">
                <div className="bzak-promo-card">
                  <h4>New Season, New Style</h4>
                  <button className="bzak-outline-btn" onClick={() => navigate("/shop")}>Shop Now &rarr;</button>
                </div>
              </div>
              {bestSells.map((p) => (
                <div className="col-6 col-lg-2" key={p.id || p.slug || p.name}>
                  <div className="bzak-product-card">
                    <Link to={`/product/${p.slug}`} className="bzak-product-card-link">
                      <div className="bzak-product-media">
                        {p.tag && <span className="bzak-product-tag">{p.tag}</span>}
                        <div className="bzak-product-img">
                          {firstImage(p) && (
                            <img src={getImageUrl(firstImage(p))} alt={p.name} loading="lazy" />
                          )}
                        </div>
                      </div>
                      <p className="bzak-product-name">{p.name}</p>
                    </Link>
                    <div className="bzak-stars">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar key={i} />
                      ))}
                    </div>
                    <div className="bzak-price">
                      <span className="new">{formatPrice(p.price)}</span>
                      {p.old_price && <span className="old">{formatPrice(p.old_price)}</span>}
                    </div>
                    {p.sold != null && p.total != null && p.total > 0 && (
                      <>
                        <div className="bzak-sold-bar">
                          <div
                            className="bzak-sold-fill"
                            style={{ width: `${(p.sold / p.total) * 100}%` }}
                          />
                        </div>
                        <span className="bzak-sold-text">
                          Sold: {p.sold}/{p.total}
                        </span>
                      </>
                    )}
                    <button
                      className="bzak-add-btn"
                      onClick={() => handleAddToCart(p.id)}
                      disabled={addingId === p.id}
                    >
                      {addingId === p.id ? "Adding…" : "Add To Cart"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Styles — heart is now live */}
      <section className="bzak-section">
        <div className="container">
          <div className="d-flex justify-content-between align-items-end flex-wrap mb-4">
            <div>
              <p className="bzak-eyebrow">Fresh Looks</p>
              <h2 className="bzak-section-title mb-0">Featured Styles</h2>
            </div>
            <div className="bzak-slider-nav">
              <button aria-label="Previous">&lsaquo;</button>
              <button className="active" aria-label="Next">
                &rsaquo;
              </button>
            </div>
          </div>

          {stylesLoading && <div className="bzak-loading-note">Loading styles…</div>}
          {!stylesLoading && stylesError && (
            <div className="bzak-loading-note">Couldn't load styles.</div>
          )}
          {!stylesLoading && !stylesError && styles.length === 0 && (
            <div className="bzak-loading-note">No new arrivals yet.</div>
          )}

          {!stylesLoading && styles.length > 0 && (
            <div className="row g-4">
              {styles.map((d) => {
                const isWished = Boolean(wishlistMap[d.id]);
                const isBusy = wishBusyId === d.id;
                return (
                  <div className="col-md-4" key={d.id || d.slug || d.name}>
                    <div className="bzak-dish-card">
                      <Link to={`/product/${d.slug}`} className="bzak-dish-card-link">
                        <div className="bzak-dish-img-wrap">
                          <div className="bzak-dish-img-inner">
                            {firstImage(d) && (
                              <img src={getImageUrl(firstImage(d))} alt={d.name} loading="lazy" />
                            )}
                          </div>
                          <button
                            type="button"
                            className={`bzak-dish-fav${isWished ? " active" : ""}`}
                            aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
                            aria-pressed={isWished}
                            disabled={isBusy}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleToggleWishlist(d);
                            }}
                          >
                            <FaHeart />
                          </button>
                        </div>
                        <h5>{d.name}</h5>
                        <p>{d.description}</p>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Deals of the Day */}
      <section className="bzak-section bzak-section-alt">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="bzak-section-title mb-0">Deals Of The Day</h2>
            <a href="/shop" className="bzak-link">
              All Deals &rsaquo;
            </a>
          </div>

          {dealsLoading && <div className="bzak-loading-note">Loading deals…</div>}
          {!dealsLoading && dealsError && (
            <div className="bzak-loading-note">Couldn't load deals.</div>
          )}
          {!dealsLoading && !dealsError && deals.length === 0 && (
            <div className="bzak-loading-note">No deals right now.</div>
          )}

          {!dealsLoading && deals.length > 0 && (
            <div className="row g-3">
              {deals.map((d) => (
                <div className="col-6 col-lg-3" key={d.id || d.slug || d.name}>
                  <div className="bzak-deal-card">
                    <Link to={`/product/${d.slug}`} className="bzak-deal-card-link">
                      {firstImage(d) && (
                        <img src={getImageUrl(firstImage(d))} alt={d.name} loading="lazy" />
                      )}
                      <div className="bzak-deal-info">
                        <p className="bzak-deal-name">{d.name}</p>
                        <span className="bzak-deal-by">By {d.by || "B-ZAK"}</span>
                      </div>
                    </Link>
                    <div className="bzak-deal-info bzak-deal-info--footer">
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div className="bzak-price">
                          <span className="new">{formatPrice(d.price)}</span>
                          {d.old_price && (
                            <span className="old">{formatPrice(d.old_price)}</span>
                          )}
                        </div>
                        <button
                          className="bzak-deal-add"
                          onClick={() => handleAddToCart(d.id)}
                          disabled={addingId === d.id}
                        >
                          {addingId === d.id ? "…" : "+ Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why choose us */}
      <section className="bzak-section">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              {bestSells[0] ? (
                <Link to={`/product/${bestSells[0].slug}`} className="bzak-why-img-link">
                  <div className="bzak-why-img">
                    {firstImage(bestSells[0]) && (
                      <img
                        src={getImageUrl(firstImage(bestSells[0]))}
                        alt={bestSells[0].name}
                        loading="lazy"
                      />
                    )}
                  </div>
                </Link>
              ) : (
                <div className="bzak-why-img" aria-hidden="true" />
              )}
            </div>
            <div className="col-lg-6">
              <h2 className="bzak-section-title">Why People Choose B-ZAK?</h2>
              <div className="bzak-why-item">
                <h5>Premium Fabric</h5>
                <p>
                  Every piece is made from durable, breathable materials
                  designed to last wash after wash.
                </p>
              </div>
              <div className="bzak-why-item">
                <h5>Perfect Fit</h5>
                <p>
                  From tees to track pants, our sizing is built for real
                  comfort and everyday movement.
                </p>
              </div>
              <div className="bzak-why-item">
                <h5>Style That Defines You</h5>
                <p>
                  Timeless designs with the iconic B-ZAK shield — built to
                  stand out, made to last.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter banner */}
      <section className="bzak-newsletter">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <h3>Stay ahead of the drop</h3>
              <p>Get early access to new B-ZAK arrivals and exclusive deals</p>
              <form
                className="bzak-newsletter-form"
                onSubmit={(e) => e.preventDefault()}
              >
                <input type="email" placeholder="Your email address" required />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="bzak-features">
        <div className="container">
          <div className="row g-4 text-center text-md-start">
            {features.map((f) => (
              <div className="col-6 col-md-4 col-lg" key={f.title}>
                <div className="bzak-feature-item">
                  <span className="bzak-feature-icon">{f.icon}</span>
                  <div>
                    <h6>{f.title}</h6>
                    <p>{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;