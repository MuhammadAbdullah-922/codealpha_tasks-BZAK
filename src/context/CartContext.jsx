import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({ baseURL: API_URL });

// Attach the Sanctum token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get("/cart");
      setCartItems(data.items);
      setError(null);
    } catch (err) {
      setError("Couldn't load your cart. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    const { data } = await api.post("/cart/items", { product_id: productId, quantity });
    setCartItems((prev) => {
      const exists = prev.find((i) => i.id === data.id);
      return exists ? prev.map((i) => (i.id === data.id ? data : i)) : [data, ...prev];
    });
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    // optimistic update so the UI feels instant
    setCartItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
    try {
      await api.put(`/cart/items/${itemId}`, { quantity });
    } catch (err) {
      fetchCart(); // roll back to server truth on failure
    }
  };

  const removeItem = async (itemId) => {
    const prevItems = cartItems;
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    try {
      await api.delete(`/cart/items/${itemId}`);
    } catch (err) {
      setCartItems(prevItems);
    }
  };

  const clearCart = async () => {
    await api.delete("/cart");
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

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