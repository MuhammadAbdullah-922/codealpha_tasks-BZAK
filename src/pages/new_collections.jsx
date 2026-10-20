import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, extractList, getImageUrl } from "../services/api";
import "../styles/new_collections.css";

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

const ImportedCollection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts({ category: "imported", per_page: 24 })
      .then((res) => {
        setProducts(extractList(res));
      })
      .catch((err) => console.error("Failed to load imported collection:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", background: "#0a0a0a", color: "#f5f2ec" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Fallback: no products assigned to this category yet — keep the original stamp design
  if (products.length === 0) {
    return (
      <section className="bzak-imp">
        <div className="bzak-imp-inner">
          <div className="bzak-imp-stamp" aria-hidden="true">
            <svg viewBox="0 0 220 220">
              <defs>
                <path
                  id="stampCircle"
                  d="M 110,110 m -85,0 a 85,85 0 1,1 170,0 a 85,85 0 1,1 -170,0"
                />
              </defs>
              <circle cx="110" cy="110" r="96" className="bzak-imp-stamp-ring-outer" />
              <circle cx="110" cy="110" r="74" className="bzak-imp-stamp-ring-inner" />
              <text className="bzak-imp-stamp-text">
                <textPath href="#stampCircle" startOffset="0%">
                  • WORLDWIDE SOURCED • LIMITED DROP • ARRIVING SOON
                </textPath>
              </text>
              <text x="110" y="102" textAnchor="middle" className="bzak-imp-stamp-word">
                B-ZAK
              </text>
              <text x="110" y="128" textAnchor="middle" className="bzak-imp-stamp-word-sm">
                IMPORT CO.
              </text>
            </svg>
          </div>

          <p className="bzak-imp-eyebrow">Manifest No. BZK—IMP—01</p>

          <h1 className="bzak-imp-title">
            The Imported
            <br />
            Collection
          </h1>

          <p className="bzak-imp-sub">
            Pieces sourced off the beaten path — pulled from streets, ports, and
            archives around the world, then cleared for landing on B-ZAK.
            Customs is still processing the first shipment.
          </p>

          <div className="bzak-imp-route">
            <span className="bzak-imp-route-point">WORLDWIDE</span>
            <span className="bzak-imp-route-line" aria-hidden="true" />
            <span className="bzak-imp-route-plane" aria-hidden="true">
              ✈
            </span>
            <span className="bzak-imp-route-line" aria-hidden="true" />
            <span className="bzak-imp-route-point bzak-imp-route-point--dest">
              B-ZAK
            </span>
          </div>

          <Link to="/shop" className="bzak-imp-cta">
            Shop What&apos;s In Stock
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "60px 20px" }}>
      <h1 style={{ textAlign: "center", fontSize: "2.2rem", fontWeight: 700, marginBottom: "40px" }}>
        Imported Collection
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

export default ImportedCollection;