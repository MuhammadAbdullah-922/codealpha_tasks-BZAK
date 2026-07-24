import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";

import "../styles/Wishlist.css";

import {
  getWishlist,
  getImageUrl,
} from "../services/api";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

// Handles every shape the API might send back for an item's picture:
//   item.image  -> plain string
//   item.images -> array, e.g. ["products/pic5.jpeg"]
//   item.images -> JSON string, e.g. '["products/pic5.jpeg"]'
// Same helper used in Home.jsx / Shop.jsx.
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

export default function Wishlist() {
  const { removeFromWishlist, setWishlistFromItems } = useWishlist();
  const { addToCart } = useCart();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
  loadWishlist();
}, [loadWishlist]);

  const loadWishlist = useCallback(async () => {
  try {
    const res = await getWishlist();
    const items = res.data.wishlist || [];
    setWishlist(items);
    setWishlistFromItems(items);
  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
}, [setWishlistFromItems]);
  

  // Goes through the shared WishlistContext so the navbar badge count
  // updates instantly, instead of calling the API directly and leaving
  // the badge stale until next refresh.
  const handleDelete = async (item) => {
    if (!window.confirm("Remove this item from your wishlist?")) return;
    setRemovingId(item.id);
    try {
      await removeFromWishlist(item.id, item.product?.id);
      setWishlist((prev) => prev.filter((w) => w.id !== item.id));
    } catch (err) {
      console.log(err);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (product) => {
    setAddingId(product.id);
    try {
      await addToCart(product.id, 1);
      setAddedId(product.id);
      showToast(`${product.name} added to cart`);
      // Button shows "Added ✓" briefly, then reverts to normal
      window.setTimeout(() => setAddedId((cur) => (cur === product.id ? null : cur)), 1600);
    } catch (err) {
      console.log(err);
      if (err?.response?.status === 401) {
        showToast("Please login to add items to cart", "error");
      } else {
        showToast("Couldn't add to cart, try again", "error");
      }
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="wishlist-loading">
        Loading...
      </div>
    );
  }

  return (
    <section className="wishlist-page">
      {toast && (
        <div className={`wishlist-toast wishlist-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
      <div className="container">

        <h1 className="wishlist-title">
          My Wishlist
        </h1>

        {wishlist.length > 0 && (
          <p className="wishlist-count">
            {wishlist.length} item{wishlist.length > 1 ? "s" : ""} saved
          </p>
        )}

        {wishlist.length === 0 ? (

          <div className="wishlist-empty">

            <h3>Your Wishlist is Empty</h3>

            <Link
              to="/shop"
              className="wishlist-shop-btn"
            >
              Continue Shopping
            </Link>

          </div>

        ) : (

          <div className="wishlist-table-wrapper">

            <table className="wishlist-table">

              <thead>

                <tr>
                  <th></th>
                  <th>Product Name</th>
                  <th>Unit Price</th>
                  <th>Stock Status</th>
                  <th></th>
                </tr>

              </thead>

              <tbody>

                {wishlist.map((item) => {

                  const product = item.product;

                  return (

                    <tr key={item.id}>

                      {/* Delete */}

                      <td>

                        <button
                          className="wishlist-delete"
                          onClick={() => handleDelete(item)}
                          disabled={removingId === item.id}
                          aria-label="Remove from wishlist"
                        >
                          <FaTrashAlt />
                        </button>

                      </td>

                      {/* Product */}

                      <td>

                        <Link
                          to={`/product/${product.slug}`}
                          className="wishlist-product"
                        >

                          <img
                            src={getImageUrl(firstImage(product))}
                            alt={product.name}
                            loading="lazy"
                          />

                          <span>
                            {product.name}
                          </span>

                        </Link>

                      </td>

                      {/* Price */}

                      <td>

                        <div className="wishlist-price">

                          {product.sale_price ? (
                            <>
                              <del>
                                Rs {product.price}
                              </del>

                              <strong>
                                Rs {product.sale_price}
                              </strong>
                            </>
                          ) : (
                            <strong>
                              Rs {product.price}
                            </strong>
                          )}

                        </div>

                      </td>

                      {/* Stock */}

                      <td>

                        {product.stock > 0 ? (

                          <span className="stock-in">
                            In Stock
                          </span>

                        ) : (

                          <span className="stock-out">
                            Out of Stock
                          </span>

                        )}

                      </td>

                      {/* Action */}

                      <td>

                        <div className="wishlist-action">

                          <small>
                            Added on{" "}
                            {new Date(item.created_at).toLocaleDateString()}
                          </small>

                          <button
                            className={`wishlist-cart-btn${addedId === product.id ? " added" : ""}`}
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock <= 0 || addingId === product.id}
                          >
                            {addingId === product.id
                              ? "Adding…"
                              : addedId === product.id
                              ? "Added ✓"
                              : "Add to Cart"}
                          </button>

                        </div>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>

        )}

      </div>
    </section>
  );
}