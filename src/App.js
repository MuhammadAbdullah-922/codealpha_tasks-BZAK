import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import WhatsAppButton from "./components/WhatsAppButton";
import HadeesStrip from "./components/HadeesStrip";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/Product_details";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import MyAccount from "./pages/MyAccount";
// import Order_tracking from "./pages/Order_tracking";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import About from "./pages/About";
import MensWinterCollection from "./pages/MensWinterCollection";
import ImportedCollection from "./pages/new_collections";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ReturnRefundPolicy from "./pages/ReturnRefundPolicy";
import ShippingDelivery from "./pages/Shippingdelivery";
import BankPaymentDetails from "./pages/Bankpaymentdetails";

function App() {
  return (
    <HelmetProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <ScrollToTop />

            <Navbar />

            {/* Hadees Strip - Navbar ke neeche */}
            <HadeesStrip />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route
                path="/new_collections"
                element={<ImportedCollection />}
              />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/my-account" element={<MyAccount />} />
              <Route path="/product/:slug" element={<ProductDetails />} />

              <Route
                path="/mens-winter-collection"
                element={<MensWinterCollection />}
              />

              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
             
              <Route path="/shipping-delivery-policy" element={<ShippingDelivery />} />
              <Route path="/return-refund-policy"  element={<ReturnRefundPolicy />} />
              <Route path="/bank-payment-details" element={<BankPaymentDetails />} />
              
             

              {/* <Route path="/order-tracking" element={<Order_tracking />} /> */}
            </Routes>

            <Footer />
            <WhatsAppButton />
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </HelmetProvider>
  );
}

export default App;