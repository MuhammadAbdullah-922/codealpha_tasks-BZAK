import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getWishlist, addToWishlist, removeWishlistItem } from "../services/api";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  // wishlistMap: { [product_id]: wishlist_row_id } — single source of truth
  // for both "is this product wished" AND the navbar count.
  const [wishlistMap, setWishlistMap] = useState({});
  const wishlistCount = Object.keys(wishlistMap).length;

  const refreshWishlist = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setWishlistMap({});
      return;
    }
    try {
      const res = await getWishlist();
      const items = res?.data?.wishlist || [];
      const map = {};
      items.forEach((item) => {
        if (item?.product?.id) map[item.product.id] = item.id;
      });
      setWishlistMap(map);
    } catch {
      // logged in but request failed — leave map as-is
    }
  }, []);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  // Toggle a single product. Returns { added: boolean } on success,
  // throws on failure so callers can show their own toast/redirect.
  const toggleWishlist = useCallback(
    async (productId) => {
      const token = localStorage.getItem("token");
      if (!token) {
        const err = new Error("not_authenticated");
        err.code = "not_authenticated";
        throw err;
      }

      const existingRowId = wishlistMap[productId];

      if (existingRowId) {
        await removeWishlistItem(existingRowId);
        setWishlistMap((prev) => {
          const next = { ...prev };
          delete next[productId];
          return next;
        });
        return { added: false };
      } else {
        const res = await addToWishlist(productId);
        const newRowId = res?.data?.wishlist?.id || res?.data?.id;
        setWishlistMap((prev) => ({ ...prev, [productId]: newRowId }));
        return { added: true };
      }
    },
    [wishlistMap]
  );

  // Direct remove (used by the Wishlist page's trash icon, where we
  // already know the row id and don't need to look it up).
  const removeFromWishlist = useCallback(async (rowId, productId) => {
    await removeWishlistItem(rowId);
    setWishlistMap((prev) => {
      const next = { ...prev };
      if (productId != null) delete next[productId];
      return next;
    });
  }, []);

  const isWished = useCallback(
    (productId) => Boolean(wishlistMap[productId]),
    [wishlistMap]
  );

  // Lets any page that already fetched the full wishlist (with product
  // details) push that exact data into the shared map, instead of the
  // context doing its own separate fetch. This is what keeps the navbar
  // badge count and the Wishlist page's item count from ever drifting
  // apart — they're built from the same response.
  const setWishlistFromItems = useCallback((items) => {
    const map = {};
    (items || []).forEach((item) => {
      if (item?.product?.id) map[item.product.id] = item.id;
    });
    setWishlistMap(map);
  }, []);

  return (
    <WishlistContext.Provider
      value={{
        wishlistMap,
        wishlistCount,
        isWished,
        toggleWishlist,
        removeFromWishlist,
        refreshWishlist,
        setWishlistFromItems,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used inside a WishlistProvider");
  }
  return ctx;
}