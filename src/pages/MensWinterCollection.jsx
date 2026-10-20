import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaSnowflake } from "react-icons/fa";
import { getProducts, extractList, getImageUrl } from "../services/api";

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

const formatPrice = (value) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const MensWinterCollection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ category: "winter-collection", per_page: 24 })
      .then((res) => {
        setProducts(extractList(res));
      })
      .catch((err) => console.error("Failed to load winter collection:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Fallback: no products assigned to this category yet
  if (products.length === 0) {
    return (
      <section
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 20px",
        }}
      >
        <div>
          <FaSnowflake size={48} style={{ marginBottom: "20px", color: "#0d6efd" }} />
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "12px" }}>
            Mens Winter Collection
          </h1>
          
          <p style={{ color: "#888", marginBottom: "24px" }}>
            We're putting the finishing touches on this collection. Check back soon!
          </p>
          <Link
            to="/shop"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              background: "#000",
              color: "#fff",
              borderRadius: "4px",
              textDecoration: "none",
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "60px 20px" }}>
      <h1 style={{ textAlign: "center", fontSize: "2.2rem", fontWeight: 700, marginBottom: "40px" }}>
        Mens Winter Collection
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {products.map((product) => {
          const imagePath = firstImage(product);

          return (
            <Link
              key={product.id}
              to={`/product/${product.slug}`}
              style={{ textDecoration: "none", color: "#000" }}
            >
              <div
                style={{
                  aspectRatio: "3 / 4",
                  overflow: "hidden",
                  borderRadius: "6px",
                  background: "#f2f2f2",
                }}
              >
                {imagePath && (
                  <img
                    src={getImageUrl(imagePath)}
                    alt={product.name}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>
              <h3 style={{ fontSize: "1rem", marginTop: "10px" }}>{product.name}</h3>
              <p style={{ fontWeight: 700 }}>
                {product.sale_price ? (
                  <>
                    <span style={{ textDecoration: "line-through", color: "#999", marginRight: "8px" }}>
                      {formatPrice(product.price)}
                    </span>
                    {formatPrice(product.sale_price)}
                  </>
                ) : (
                  formatPrice(product.price)
                )}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default MensWinterCollection;