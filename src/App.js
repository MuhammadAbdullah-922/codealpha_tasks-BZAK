import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Product_details from "./pages/Product_details";
import Cart from "./pages/Cart";
 import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import My_account from "./pages/MyAccount";
// import Order_tracking from "./pages/Order_tracking";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import About from "./pages/About";

function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/my-account" element={<My_account />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/product/:slug" element={<Product_details />} />
               <Route path="/checkout" element={<Checkout />} />
               <Route path="/wishlist" element={<Wishlist />} />

              {/* 
             
              <Route path="/order-tracking" element={<Order_tracking />} />
              */}
            </Routes>
            <Footer />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;