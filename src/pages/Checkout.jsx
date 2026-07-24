import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getImageUrl,
  getProfile,
  login,
  placeOrder,
  uploadPaymentProof,
  clearCart,
} from "../services/api";
import Swal from "sweetalert2";
import "../styles/Checkout.css";

const firstImage = (product) => {
  const raw = product?.images ?? product?.image;
  if (!raw) return null;
  if (Array.isArray(raw)) return raw[0] || null;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed[0] || null : raw;
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

// Placeholder delivery rates — wire these to real shipping rules once
// the backend defines them; kept simple and explicit for now.
const DELIVERY_RATES = {
  free: 0,
  flat: 200,
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, loading: cartLoading } = useCart();

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [customerMode, setCustomerMode] = useState("register"); // 'register' | 'guest'
  const [guestContinued, setGuestContinued] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  const [deliveryMethod, setDeliveryMethod] = useState("free");
  const [paymentMethod, setPaymentMethod] = useState("cod");
 
  const [comments, setComments] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  // Bank Transfer reference — now a fully controlled field like the others.
  const [bankReference, setBankReference] = useState("");
  // Payment screenshot for JazzCash/EasyPaisa/Bank — uploaded in a
  // separate request right after the order is created.
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const [billing, setBilling] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    country: "",
    region: "",
  });

  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Prefill billing details for logged-in users
  useEffect(() => {
    if (!isLoggedIn) return;
    getProfile()
      .then((res) => {
        const p = res.data.user || res.data;
        if (!p) return;
        const [first, ...rest] = (p.name || "").split(" ");
        setBilling((b) => ({
          ...b,
          firstName: first || b.firstName,
          lastName: rest.join(" ") || b.lastName,
          address: p.address || b.address,
          city: p.city || b.city,
        }));
      })
      .catch(() => {
        // non-critical — user can just fill the form manually
      });
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loginLoading) return;
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await login({ email: loginEmail, password: loginPassword });
      const token = res.data.token || res.data.access_token;
      if (token) {
        localStorage.setItem("token", token);
        setIsLoggedIn(true);
      }
    } catch {
      setLoginError("Incorrect email or password.");
    } finally {
      setLoginLoading(false);
    }
  };

  const deliveryCharge = DELIVERY_RATES[deliveryMethod] ?? 0;
  const totalAmount = cartTotal + deliveryCharge;

  const canFillBilling = isLoggedIn || guestContinued;

  const handleBillingChange = (field) => (e) =>
    setBilling((b) => ({ ...b, [field]: e.target.value }));

  // Reset the payment-proof fields whenever the method changes so stale
  // data from a previously-selected method never gets submitted.
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setTransactionId("");
    setSenderNumber("");
    setBankReference("");
    setProofFile(null);
    setProofPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  // Validate + preview the uploaded payment screenshot.
  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      Swal.fire({
        icon: "warning",
        title: "Invalid File",
        text: "Screenshot must be a JPG, PNG, or WEBP image.",
        confirmButtonColor: "#000",
      });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: "File Too Large",
        text: "Screenshot must be under 4MB.",
        confirmButtonColor: "#000",
      });
      return;
    }

    setProofFile(file);
    setProofPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const showAlert = (icon, title, text) => {
    Swal.fire({ icon, title, text, confirmButtonColor: "#000" });
  };

  const handlePlaceOrder = async () => {
    if (placing) return;

    if (!isLoggedIn) {
      showAlert(
        "warning",
        "Login Required",
        "Guest checkout isn't available yet — please log in or create an account to place your order."
      );
      return;
    }

    if (
      !billing.firstName ||
      !billing.lastName ||
      !billing.phone ||
      !billing.address ||
      !billing.city
    ) {
      showAlert("warning", "Missing Information", "Please fill in all required billing fields.");
      return;
    }

    if (
      (paymentMethod === "jazzcash" || paymentMethod === "easypaisa") &&
      (!transactionId || !senderNumber)
    ) {
      showAlert(
        "warning",
        "Missing Payment Details",
        "Please enter the Transaction ID and Sender Mobile Number."
      );
      return;
    }
    if (paymentMethod === "bank" && !bankReference) {
      showAlert("warning", "Missing Payment Details", "Please enter your bank transaction reference.");
      return;
    }
    if (paymentMethod !== "cod" && !proofFile) {
      showAlert("warning", "Screenshot Required", "Please upload a screenshot of your payment.");
      return;
    }

    setPlacing(true);
    setPlaceError(null);
    try {
      const items = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
      }));
      const addressParts = [
        billing.address,
        billing.postcode,
        billing.region,
        billing.country,
      ].filter(Boolean);

      const res = await placeOrder({
        items,
        payment_method: paymentMethod,
        transaction_id: paymentMethod === "bank" ? bankReference : transactionId,
        sender_number: senderNumber,
        bank_reference: bankReference,
        shipping: deliveryCharge,
        shipping_address: addressParts.join(", "),
        shipping_city: billing.city,
        shipping_phone: billing.phone,
        notes: comments,
      });

      if (proofFile) {
        const orderNumber = res?.data?.order?.order_number;
        if (orderNumber) {
          setUploadingProof(true);
          try {
            const formData = new FormData();
            formData.append("proof", proofFile);
            await uploadPaymentProof(orderNumber, formData);
          } catch {
            showAlert(
              "warning",
              "Order Placed",
              "Order placed, but the payment screenshot didn't upload. You can re-upload it from your order history."
            );
          } finally {
            setUploadingProof(false);
          }
        }
      }

      await clearCart();

      await Swal.fire({
        icon: "success",
        title: "Order Placed!",
        text: "Your order has been placed successfully.",
        confirmButtonColor: "#000",
      });

      navigate("/", { state: { orderPlaced: true } });
    } catch {
      showAlert(
        "error",
        "Order Failed",
        "Couldn't place your order — please check your details and try again."
      );
    } finally {
      setPlacing(false);
    }
  };

  if (cartLoading) {
    return (
      <>
        <Navbar />
        <main className="checkout-page">
          <p className="checkout-state">Loading your cart…</p>
        </main>
        <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <section className="checkout-breadcrumb">
          <div className="checkout-breadcrumb__inner">
            <h1>Checkout</h1>
            <p>
              <Link to="/">Home</Link> - Checkout
            </p>
          </div>
        </section>
        <main className="checkout-page">
          <div className="checkout-empty">
            <p>Your cart is empty — add something before checking out.</p>
            <Link to="/shop" className="checkout-empty__link">
              Start Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="checkout-breadcrumb">
        <div className="checkout-breadcrumb__inner">
          <h1>Checkout</h1>
          <p>
            <Link to="/">Home</Link> - Checkout
          </p>
        </div>
      </section>

      <main className="checkout-page">
        <div className="checkout-layout">
          {/* ---------------- Left column ---------------- */}
          <div className="checkout-col">
            <div className="checkout-card">
              <h3 className="checkout-card__title">Summary</h3>

              <div className="checkout-summary-row">
                <span>Sub-Total</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="checkout-summary-row">
                <span>Delivery Charges</span>
                <span>{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="checkout-summary-row checkout-summary-row--total">
                <span>Total Amount</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>

              <div className="checkout-summary-items">
                {cartItems.map((item) => {
                  const img = firstImage(item.product);
                  return (
                    <div className="checkout-summary-item" key={item.id}>
                      {img ? (
                        <img src={getImageUrl(img)} alt={item.product.name} />
                      ) : (
                        <div className="checkout-summary-item__placeholder" />
                      )}
                      <div>
                        <p className="checkout-summary-item__name">
                          {item.product.name} × {item.quantity}
                        </p>
                        <div className="checkout-summary-item__price">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="checkout-card">
              <h3 className="checkout-card__title">Delivery Method</h3>
              <p className="checkout-card__hint">
                Please select the preferred shipping method to use on this order.
              </p>

              <div className="checkout-radio-row">
                <label className="checkout-radio">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "free"}
                    onChange={() => setDeliveryMethod("free")}
                  />
                  <span>
                    Free Shipping
                    <small>Rate - Rs 0</small>
                  </span>
                </label>
                <label className="checkout-radio">
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "flat"}
                    onChange={() => setDeliveryMethod("flat")}
                  />
                  <span>
                    Flat Rate
                    <small>Rate - Rs 200</small>
                  </span>
                </label>
              </div>

              <label className="checkout-field">
                <span>Add Comments About Your Order</span>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </label>
            </div>

            <div className="checkout-card">
              <h3 className="checkout-card__title">Payment Method</h3>
              <p className="checkout-card__hint">
                Please select the preferred payment method to use on this order.
              </p>

              <div className="checkout-radio-col">
                <label className="checkout-radio">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "cod"}
                    onChange={() => handlePaymentMethodChange("cod")}
                  />
                  <span>Cash On Delivery</span>
                </label>
                <label className="checkout-radio">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "jazzcash"}
                    onChange={() => handlePaymentMethodChange("jazzcash")}
                  />
                  <span>JazzCash</span>
                </label>
                <label className="checkout-radio">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "easypaisa"}
                    onChange={() => handlePaymentMethodChange("easypaisa")}
                  />
                  <span>EasyPaisa</span>
                </label>
                <label className="checkout-radio">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "bank"}
                    onChange={() => handlePaymentMethodChange("bank")}
                  />
                  <span>Bank Transfer</span>
                </label>
              </div>

              {/* Cash on Delivery */}
              {paymentMethod === "cod" && (
                <div className="payment-box">
                  <h4>Cash on Delivery</h4>
                  <p>
                    Pay in cash when your order is delivered. No advance payment is
                    required.
                  </p>
                </div>
              )}

              {/* JazzCash */}
              {paymentMethod === "jazzcash" && (
                <div className="payment-box">
                  <h4>JazzCash Payment</h4>

                  <p>
                    <strong>Account Name:</strong> BZAK Store
                  </p>
                  <p>
                    <strong>Mobile:</strong> 0300-1234567
                  </p>

                  <label className="checkout-field">
                    <span>Transaction ID*</span>
                    <input
                      type="text"
                      placeholder="e.g. TXN123456789"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </label>

                  <label className="checkout-field">
                    <span>Sender Mobile Number*</span>
                    <input
                      type="tel"
                      placeholder="e.g. 03001234567"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                    />
                  </label>

                  <label className="checkout-field" style={{ marginTop: 4 }}>
                    <span>Upload Payment Screenshot*</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleProofFileChange}
                    />
                  </label>
                  {proofPreview && paymentMethod === "jazzcash" && (
                    <img
                      src={proofPreview}
                      alt="Payment proof preview"
                      style={{ maxWidth: 160, borderRadius: 6, marginTop: 8 }}
                    />
                  )}

                  <small>Your payment will be verified before processing the order.</small>
                </div>
              )}

              {/* EasyPaisa */}
              {paymentMethod === "easypaisa" && (
                <div className="payment-box">
                  <h4>EasyPaisa Payment</h4>

                  <p>
                    <strong>Account Name:</strong> BZAK Store
                  </p>
                  <p>
                    <strong>Mobile:</strong> 0311-1234567
                  </p>

                  <label className="checkout-field">
                    <span>Transaction ID*</span>
                    <input
                      type="text"
                      placeholder="e.g. TXN123456789"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                    />
                  </label>

                  <label className="checkout-field">
                    <span>Sender Mobile Number*</span>
                    <input
                      type="tel"
                      placeholder="e.g. 03111234567"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                    />
                  </label>

                  <label className="checkout-field" style={{ marginTop: 4 }}>
                    <span>Upload Payment Screenshot*</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleProofFileChange}
                    />
                  </label>
                  {proofPreview && paymentMethod === "easypaisa" && (
                    <img
                      src={proofPreview}
                      alt="Payment proof preview"
                      style={{ maxWidth: 160, borderRadius: 6, marginTop: 8 }}
                    />
                  )}

                  <small>Your payment will be verified before processing the order.</small>
                </div>
              )}

              {/* Bank Transfer */}
              {paymentMethod === "bank" && (
                <div className="payment-box">
                  <h4>Bank Transfer</h4>

                  <p>
                    <strong>Bank:</strong> Meezan Bank
                  </p>
                  <p>
                    <strong>Account Title:</strong> BZAK Store
                  </p>
                  <p>
                    <strong>IBAN:</strong> PK00MEZN0000000000000000
                  </p>

                  <label className="checkout-field">
                    <span>Transaction Reference*</span>
                    <input
                      type="text"
                      placeholder="e.g. Bank receipt / reference no."
                      value={bankReference}
                      onChange={(e) => setBankReference(e.target.value)}
                    />
                  </label>

                  <label className="checkout-field" style={{ marginTop: 4 }}>
                    <span>Upload Payment Screenshot*</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleProofFileChange}
                    />
                  </label>
                  {proofPreview && paymentMethod === "bank" && (
                    <img
                      src={proofPreview}
                      alt="Payment proof preview"
                      style={{ maxWidth: 160, borderRadius: 6, marginTop: 8 }}
                    />
                  )}

                  <small>After payment, upload your screenshot and enter the reference above.</small>
                </div>
              )}
            </div>
          </div>

          {/* ---------------- Right column ---------------- */}
          <div className="checkout-col">
            {!isLoggedIn && !guestContinued && (
              <>
                <div className="checkout-card">
                  <h3 className="checkout-card__title">New Customer</h3>
                  <p className="checkout-card__label">Checkout Options</p>

                  <div className="checkout-radio-row">
                    <label className="checkout-radio">
                      <input
                        type="radio"
                        name="customerMode"
                        checked={customerMode === "register"}
                        onChange={() => setCustomerMode("register")}
                      />
                      <span>Register Account</span>
                    </label>
                    <label className="checkout-radio">
                      <input
                        type="radio"
                        name="customerMode"
                        checked={customerMode === "guest"}
                        onChange={() => setCustomerMode("guest")}
                      />
                      <span>Guest Account</span>
                    </label>
                  </div>

                  <p className="checkout-card__hint">
                    By creating an account you will be able to shop faster, be up to
                    date on an order's status, and keep track of the orders you have
                    previously made.
                  </p>

                  <button
                    type="button"
                    className="checkout-btn"
                    onClick={() => {
                      if (customerMode === "register") {
                        navigate("/register");
                      } else {
                        setGuestContinued(true);
                      }
                    }}
                  >
                    Continue
                  </button>
                </div>

                <div className="checkout-card">
                  <h3 className="checkout-card__title">Returning Customer</h3>
                  <form onSubmit={handleLogin}>
                    <label className="checkout-field">
                      <span>Email Address</span>
                      <input
                        type="email"
                        placeholder="Enter your email address"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </label>
                    <label className="checkout-field">
                      <span>Password</span>
                      <input
                        type="password"
                        placeholder="Enter your password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </label>

                    {loginError && <p className="checkout-error">{loginError}</p>}

                    <div className="checkout-login-row">
                      <button type="submit" className="checkout-btn" disabled={loginLoading}>
                        {loginLoading ? "Logging in…" : "Login"}
                      </button>
                      <Link to="/forgot-password" className="checkout-link">
                        Forgot Password?
                      </Link>
                    </div>
                  </form>
                </div>
              </>
            )}

            {canFillBilling && (
              <div className="checkout-card">
                <h3 className="checkout-card__title">Billing Details</h3>

                <div className="checkout-form-grid">
                  <label className="checkout-field">
                    <span>First Name*</span>
                    <input
                      type="text"
                      placeholder="Enter your first name"
                      value={billing.firstName}
                      onChange={handleBillingChange("firstName")}
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Last Name*</span>
                    <input
                      type="text"
                      placeholder="Enter your last name"
                      value={billing.lastName}
                      onChange={handleBillingChange("lastName")}
                    />
                  </label>
                </div>

                <label className="checkout-field">
                  <span>Address*</span>
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={billing.address}
                    onChange={handleBillingChange("address")}
                  />
                </label>

                <label className="checkout-field">
                  <span>Phone Number*</span>
                  <input
                    type="tel"
                    placeholder="e.g. 03157724828"
                    value={billing.phone}
                    onChange={handleBillingChange("phone")}
                  />
                </label>

                <div className="checkout-form-grid">
                  <label className="checkout-field">
                    <span>City*</span>
                    <input
                      type="text"
                      placeholder="City"
                      value={billing.city}
                      onChange={handleBillingChange("city")}
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Post Code</span>
                    <input
                      type="text"
                      placeholder="Post Code"
                      value={billing.postcode}
                      onChange={handleBillingChange("postcode")}
                    />
                  </label>
                </div>

                <div className="checkout-form-grid">
                  <label className="checkout-field">
                    <span>Country</span>
                    <input
                      type="text"
                      placeholder="Country"
                      value={billing.country}
                      onChange={handleBillingChange("country")}
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Region / State</span>
                    <input
                      type="text"
                      placeholder="Region/State"
                      value={billing.region}
                      onChange={handleBillingChange("region")}
                    />
                  </label>
                </div>

                {placeError && <p className="checkout-error">{placeError}</p>}

                <button
                  type="button"
                  className="checkout-place-btn"
                  onClick={handlePlaceOrder}
                  disabled={placing || uploadingProof}
                >
                  {placing
                    ? "Placing Order…"
                    : uploadingProof
                    ? "Uploading Screenshot…"
                    : "Place Order"}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}