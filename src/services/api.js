import axios from "axios";

const api = axios.create({
  baseURL: "https://api.bzakapparel.com/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Fallback UUID generator — used when crypto.randomUUID() isn't available
// (e.g. during react-snap's build-time prerender, which loads pages over
// a non-secure http://localhost origin where the Crypto API's randomUUID
// method is not exposed by the headless browser).
const generateUUID = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // RFC4122-ish fallback using Math.random (good enough for a guest cart token)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Guests (not logged in) get a random token stored in localStorage so the
// Laravel side can group their cart items without requiring an account.
const getGuestCartToken = () => {
  let token = localStorage.getItem("bzack_cart_token");
  if (!token) {
    token = generateUUID();
    localStorage.setItem("bzack_cart_token", token);
  }
  return token;
};

// Token
api.interceptors.request.use((config) => {
  const token =
  localStorage.getItem("token") ||
  sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // only needed for the cart endpoints, harmless on every other request
    config.headers["X-Cart-Token"] = getGuestCartToken();
  }

  return config;
});

// ======================
// API Functions
// ======================

export const getCategories = () => api.get("/categories");

export const getProducts = (params) => api.get("/products", { params });

export const getFeaturedProducts = () => api.get("/products/featured");

export const getNewArrivals = () => api.get("/products/new-arrivals");

// NEW: Popular products (sorted by total quantity sold on the backend)
export const getPopularProducts = () => api.get("/products/popular");

// NEW: Distinct colors actually used across active products — powers the
// dynamic "Filter By Color" sidebar on the Product Details page.
export const getProductColors = () => api.get("/products/colors");

// Settings (public — used by Footer.jsx)
export const getSettings = () => api.get("/settings");

// Stats (public — used by About.jsx)
export const getStats = () => api.get("/stats");

// Contact form (public — used by Contact.jsx)
export const submitContactForm = (formData) => api.post("/contact", formData);

// Admin settings
export const getAdminSettings = () => api.get("/admin/settings");
export const updateAdminSettings = (formData) =>
  api.post("/admin/settings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ======================
// Cart
// ======================


export const getCart = () => api.get("/cart");

export const addToCart = (productId, quantity = 1, options = {}) =>
  api.post("/cart/items", { product_id: productId, quantity, ...options });

export const updateCartItem = (itemId, quantity) =>
  api.put(`/cart/items/${itemId}`, { quantity });

export const removeCartItem = (itemId) => api.delete(`/cart/items/${itemId}`);

export const clearCart = () => api.delete("/cart");

// ======================
// Helpers
// ======================

// Handles every shape our Laravel API returns:
//   { categories: [...] }                        -> plain array
//   { products: [...] }                           -> plain array (featured, new-arrivals, popular)
//   { products: { data: [...], current_page: 1 } } -> paginated (index)
export const extractList = (response) => {
  const body = response?.data;
  if (!body) return [];

  const resource = body.categories ?? body.products ?? body.data ?? body;

  if (Array.isArray(resource)) return resource;
  if (Array.isArray(resource?.data)) return resource.data;

  return [];
};


// FIXED: previously this always prepended "storage/" to whatever path came
// back from the backend. Some records (e.g. footer-gallery images) are
// saved with the "storage/" segment already included in the `image` field,
// which produced a broken double URL like:
//   http://localhost:8000/storage/storage/footer-gallery/xxx.jpg
// This version strips any leading slash and only adds "storage/" if the
// path doesn't already start with it, so it works no matter which format
// a given table/controller saved the path in.
export const getImageUrl = (path) => {
  if (!path) {
    return "https://via.placeholder.com/300x300?text=No+Image";
  }

  if (path.startsWith("http")) {
    return path;
  }

  const base = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");

  let cleanPath = path.replace(/^\/+/, "");

  if (!cleanPath.startsWith("storage/")) {
    cleanPath = `storage/${cleanPath}`;
  }

  return `${base}/${cleanPath}`;
};
// Reviews
export const getReviews = (productId) =>
  api.get(`/products/${productId}/reviews`);

export const addReview = (productId, data) =>
  api.post(`/products/${productId}/reviews`, data);

export const getProfile = () => api.get("/profile");

export const updateProfile = (data) => api.put("/profile", data);

// UPDATED: now accepts an optional params object (e.g. { page: 2 }) so
// MyAccount.jsx's "Load more orders" pagination can request page 2, 3, etc.
// Existing calls like getOrders() still work exactly as before since
// params defaults to undefined -> axios just sends GET /orders.
export const getOrders = (params) => api.get("/orders", { params });

export const changePassword = (data) =>
  api.post("/change-password", data);

export const logoutUser = () => api.post("/logout");
export const subscribeNewsletter = (email) =>
  api.post("/newsletter", { email });
export const getFooterGallery = () => {
  return api.get("/footer-gallery");
};
export const getProduct = (slug) => api.get(`/products/${slug}`);
export const login = (data) => api.post("/login", data);
export const placeOrder = (data) => api.post("/orders", data);

// Payment screenshot upload — the axios instance above sets a global
// "Content-Type": "application/json" default. That default is merged
// into EVERY request unless explicitly overridden, so just omitting or
// commenting out a headers block here isn't enough — it still inherits
// "application/json" and Laravel never sees a valid multipart body.
// Setting it to `undefined` here removes that inherited header so the
// browser can generate the correct "multipart/form-data; boundary=..."
// header itself.
export const uploadPaymentProof = (orderNumber, formData) =>
  api.post(`/orders/${orderNumber}/payment-proof`, formData, {
    headers: { "Content-Type": undefined },
  });

// ======================
// Wishlist
// ======================

export const getWishlist = () => api.get("/wishlist");

export const addToWishlist = (productId) =>
  api.post("/wishlist", {
    product_id: productId,
  });

export const removeWishlistItem = (id) =>
  api.delete(`/wishlist/${id}`);

export default api;