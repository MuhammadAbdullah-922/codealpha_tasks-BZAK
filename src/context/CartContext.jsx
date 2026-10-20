import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.bzakapparel.com/api";

const api = axios.create({
  baseURL: API_URL,
});

// Attach token only when user is logged in
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Auto-clear an invalid/expired token as soon as the server rejects it
// with 401, on ANY request made through this `api` instance (cart,
// wishlist, orders, etc. — not just /cart).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

const CartContext = createContext();

const GUEST_CART_KEY = "bzak_guest_cart";

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------------------------------
  // Guest cart helpers
  // ---------------------------------------

  const getGuestCart = () => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveGuestCart = (items) => {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  };

  // ---------------------------------------
  // Fetch cart
  //
  // Both branches below are "self-healing": any cart row whose `product`
  // is missing (a stale guest-cart entry saved before this fix, or a
  // product that has since been deleted from the catalog) is removed
  // permanently right here — once — instead of being filtered out on
  // every render of every page that reads the cart. This is what stops
  // the "Some items in your cart are no longer available" message from
  // reappearing on every visit.
  // ---------------------------------------

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");

    // Guest user → load cart from localStorage
    if (!token) {
      const guestCart = getGuestCart();
      const cleanCart = guestCart.filter((item) => item.product);

      // Persist the cleanup so the dead rows don't come back next visit
      if (cleanCart.length !== guestCart.length) {
        saveGuestCart(cleanCart);
      }

      setCartItems(cleanCart);
      setLoading(false);
      setError(null);
      return;
    }

    // Logged-in user → load cart from backend
    try {
      setLoading(true);

      const { data } = await api.get("/cart");
      const items = data.items || [];
      const validItems = items.filter((item) => item.product);
      const orphanIds = items
        .filter((item) => !item.product)
        .map((item) => item.id);

      // Clean orphaned rows off the backend cart too, so they don't
      // keep coming back on future logins/devices. Fire-and-forget:
      // this must never block rendering the cart.
      if (orphanIds.length) {
        Promise.allSettled(
          orphanIds.map((id) => api.delete(`/cart/items/${id}`))
        ).catch(() => {});
      }

      setCartItems(validItems);
      setError(null);
    } catch (err) {
      console.error("Fetch cart error:", err);

      // Token was stale/expired — the response interceptor above
      // already removed it from localStorage. Fall back to the guest
      // cart instead of showing a scary "couldn't load" error, since
      // from the user's point of view they're just logged out now.
      if (err?.response?.status === 401) {
        setCartItems(getGuestCart());
        setError(null);
      } else {
        setError("Couldn't load your cart. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ---------------------------------------
  // Add to cart
  // ---------------------------------------

  const addToCart = async (productId, quantity = 1, product = null) => {
    const token = localStorage.getItem("token");

    // -----------------------------------
    // Guest cart
    // -----------------------------------

    if (!token) {
      const currentCart = getGuestCart();

      const existingIndex = currentCart.findIndex(
        (item) => Number(item.product_id) === Number(productId)
      );

      let updatedCart;

      if (existingIndex !== -1) {
        updatedCart = currentCart.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      } else {
        updatedCart = [
          {
            id: `guest-${productId}`,
            product_id: productId,
            quantity,
            price: Number(product?.price || 0),
            product: product || null,
          },
          ...currentCart,
        ];
      }

      saveGuestCart(updatedCart);
      setCartItems(updatedCart);

      return updatedCart;
    }

    // -----------------------------------
    // Logged-in cart
    // -----------------------------------

    try {
      const { data } = await api.post("/cart/items", {
        product_id: productId,
        quantity,
      });

      // Defensive: if the backend response doesn't include the populated
      // `product` relation, refetch the whole cart instead of storing a
      // row with product missing (that's what crashes the Cart page).
      if (!data?.product) {
        await fetchCart();
        return data;
      }

      setCartItems((prev) => {
        const exists = prev.find((item) => item.id === data.id);

        return exists
          ? prev.map((item) => (item.id === data.id ? data : item))
          : [data, ...prev];
      });

      return data;
    } catch (err) {
      // If the token just expired mid-session, drop back to a guest
      // cart and retry the add locally instead of losing the click
      // entirely.
      if (err?.response?.status === 401) {
        return addToCart(productId, quantity, product);
      }
      throw err;
    }
  };

  // ---------------------------------------
  // Update quantity
  // ---------------------------------------

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;

    const token = localStorage.getItem("token");

    // Guest cart
    if (!token) {
      const currentCart = getGuestCart();

      const updatedCart = currentCart.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );

      saveGuestCart(updatedCart);
      setCartItems(updatedCart);

      return;
    }

    // Logged-in cart
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );

    try {
      await api.put(`/cart/items/${itemId}`, {
        quantity,
      });
    } catch (err) {
      console.error("Update quantity error:", err);
      fetchCart();
    }
  };

  // ---------------------------------------
  // Remove item
  // ---------------------------------------

  const removeItem = async (itemId) => {
    const token = localStorage.getItem("token");

    // Guest cart
    if (!token) {
      const currentCart = getGuestCart();

      const updatedCart = currentCart.filter((item) => item.id !== itemId);

      saveGuestCart(updatedCart);
      setCartItems(updatedCart);

      return;
    }

    // Logged-in cart
    const previousItems = cartItems;

    setCartItems((prev) => prev.filter((item) => item.id !== itemId));

    try {
      await api.delete(`/cart/items/${itemId}`);
    } catch (err) {
      console.error("Remove item error:", err);
      setCartItems(previousItems);
    }
  };

  // ---------------------------------------
  // Clear cart
  // ---------------------------------------

  const clearCart = async () => {
    const token = localStorage.getItem("token");

    // Guest
    if (!token) {
      localStorage.removeItem(GUEST_CART_KEY);
      setCartItems([]);
      return;
    }

    // Logged-in
    await api.delete("/cart");
    setCartItems([]);
  };

  // ---------------------------------------
  // Totals
  // ---------------------------------------

  const cartTotal = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.price || item.product?.price || 0) * item.quantity,
    0
  );

  const cartCount = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);