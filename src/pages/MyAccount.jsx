import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, getOrders, logoutUser } from "../services/api";
import "../styles/myAccount.css";
import {
  User,
  Package,
  MapPin,
  LogOut,
  ChevronDown,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  Circle,
  AlertCircle,
} from "lucide-react";

/**
 * MyAccount.jsx — Bzack Apparel Account Dashboard (fully dynamic, no mock data)
 *
 * Styling: plain CSS in ./MyAccount.css (no Tailwind dependency), so this
 * works regardless of whether Tailwind is configured in the project.
 *
 * DEPENDENCY:
 *   npm install lucide-react
 *
 * BACKEND ENDPOINTS USED (via ../services/api.js):
 *   - GET  /profile   -> getProfile()    logged-in user
 *   - PUT  /profile   -> updateProfile() save profile changes
 *   - GET  /orders    -> getOrders(params) OrderController@index (paginated)
 *   - POST /logout    -> logoutUser()
 */

const STATUS_META = {
  pending: { label: "Pending", color: "var(--ma-mustard)", icon: Clock },
  processing: { label: "Processing", color: "var(--ma-mustard)", icon: Clock },
  shipped: { label: "Shipped", color: "var(--ma-blue)", icon: Truck },
  delivered: { label: "Delivered", color: "var(--ma-sage)", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "var(--ma-rust)", icon: XCircle },
};

const STEPS = ["pending", "processing", "shipped", "delivered"];

function formatPKR(amount) {
  const n = Number(amount);
  return "Rs " + (Number.isFinite(n) ? n.toLocaleString("en-PK") : amount);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function itemCount(items = []) {
  return items.reduce((n, it) => n + (Number(it.quantity) || 0), 0);
}

// ---- Stamp-style status badge ----
function StatusStamp({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const Icon = meta.icon;
  return (
    <div className="ma-stamp" style={{ color: meta.color }}>
      <Icon size={13} strokeWidth={2.5} />
      {meta.label.toUpperCase()}
    </div>
  );
}

// ---- Stitched-dash tracking stepper ----
function TrackingStepper({ status }) {
  const currentIndex = STEPS.indexOf(status);

  if (status === "cancelled") {
    return (
      <div className="ma-cancelled-note">
        <XCircle size={16} />
        <span>Order cancelled</span>
      </div>
    );
  }

  return (
    <div className="ma-stepper">
      {STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const meta = STATUS_META[step];
        return (
          <React.Fragment key={step}>
            <div className="ma-stepper-step">
              <div
                className={`ma-stepper-node${done ? " done" : ""}`}
                style={{ "--step-color": meta.color }}
              >
                {done ? (
                  <CheckCircle2 size={13} color="#fbf9f4" strokeWidth={3} />
                ) : (
                  <Circle size={8} color="var(--ma-rule)" fill="var(--ma-rule)" />
                )}
              </div>
              <span className={`ma-stepper-label${done ? " done" : ""}`}>{meta.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`ma-stepper-line${i < currentIndex ? " done" : ""}`}
                style={{ "--step-color": meta.color }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ---- Single order "shipping label" ticket ----
function OrderTicket({ order }) {
  const [expanded, setExpanded] = useState(false);
  const count = itemCount(order.items);

  return (
    <div className="ma-ticket">
      <div className="ma-ticket-stub">
        <Package size={20} color="var(--ma-rust)" strokeWidth={1.75} />
        <span className="ma-ticket-stub-label">
          {count} ITEM{count > 1 ? "S" : ""}
        </span>
      </div>

      <div className="ma-ticket-perforation" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="ma-ticket-dot" />
        ))}
      </div>

      <div className="ma-ticket-body">
        <div className="ma-ticket-top-row">
          <div>
            <p className="ma-order-number">{order.order_number}</p>
            <p className="ma-order-date">Placed on {formatDate(order.created_at)}</p>
          </div>
          <StatusStamp status={order.status} />
        </div>

        <div className="ma-ticket-mid-row">
          <p className="ma-ticket-items-summary">
            {(order.items || []).map((it, i) => (
              <span key={i}>
                {it.product_name}
                {i < order.items.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
          <p className="ma-ticket-total">{formatPKR(order.total)}</p>
        </div>

        <button className="ma-track-btn" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Hide tracking" : "Track order"}
          <ChevronDown size={14} className={`ma-chevron${expanded ? " open" : ""}`} />
        </button>

        {expanded && (
          <div className="ma-ticket-expanded">
            <TrackingStepper status={order.status} />

            <div className="ma-ticket-detail-grid">
              <div>
                <p className="ma-detail-label">Items</p>
                <ul className="ma-detail-list">
                  {(order.items || []).map((it, i) => (
                    <li key={i}>
                      {it.product_name}{" "}
                      <span className="ma-detail-sub">
                        ({it.size}
                        {it.color ? `, ${it.color}` : ""}) × {it.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="ma-detail-label">Payment</p>
                <p style={{ margin: 0 }}>
                  {String(order.payment_method || "").toUpperCase()} —{" "}
                  <span
                    style={{
                      color:
                        order.payment_status === "paid"
                          ? "var(--ma-sage)"
                          : "var(--ma-mustard)",
                    }}
                  >
                    {order.payment_status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Empty state ----
function EmptyOrders() {
  return (
    <div className="ma-empty-state">
      <Package size={32} color="var(--ma-ink-muted)" strokeWidth={1.5} />
      <p>No orders yet</p>
      <p>Once you place an order, its tracking ticket will show up right here.</p>
    </div>
  );
}

// ---- Profile tab ----
function ProfileTab({ user, loading }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="ma-muted-text">Loading your profile…</p>;
  }

  return (
    <form onSubmit={handleSave} className="ma-form">
      <h2 className="ma-section-title">Profile</h2>

      {error && (
        <div className="ma-error-box" style={{ marginBottom: 16 }}>
          <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
          {error}
        </div>
      )}

      {["name", "email", "phone"].map((field) => (
        <div key={field} className="ma-field">
          <label className="ma-label">{field}</label>
          <input
            type={field === "email" ? "email" : "text"}
            className="ma-input"
            value={form[field]}
            onChange={(e) => setForm({ ...form, [field]: e.target.value })}
          />
        </div>
      ))}

      <button type="submit" className="ma-btn-primary" disabled={saving}>
        {saving ? "Saving…" : saved ? "Saved ✓" : "Save changes"}
      </button>
    </form>
  );
}

// ---- Addresses tab (placeholder — wire up when you have an addresses API) ----
function AddressesTab() {
  return (
    <div>
      <h2 className="ma-section-title">Addresses</h2>
      <div className="ma-placeholder-card">
        <p className="ma-muted-text" style={{ margin: 0 }}>
          Saved shipping addresses will appear here. Hook this up to your
          addresses API when ready.
        </p>
      </div>
    </div>
  );
}

// ---- Main component ----
export default function MyAccount() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");

  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch the logged-in user once on mount
  useEffect(() => {
    let active = true;
    setUserLoading(true);
    getProfile()
      .then((res) => {
        if (!active) return;
        setUser(res.data.user || res.data);
        setUserError(null);
      })
      .catch((err) => {
        if (!active) return;
        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }
        setUserError("Could not load your profile.");
      })
      .finally(() => active && setUserLoading(false));
    return () => {
      active = false;
    };
  }, [navigate]);

  const fetchOrders = useCallback((pageNum, append = false) => {
    append ? setLoadingMore(true) : setOrdersLoading(true);
    setOrdersError(null);
    getOrders({ page: pageNum })
      .then((res) => {
        // OrderController@index returns { success, orders } where
        // `orders` is a Laravel paginator: { data, current_page, last_page, ... }
        const paginator = res.data.orders;
        const newOrders = paginator?.data || [];
        setOrders((prev) => (append ? [...prev, ...newOrders] : newOrders));
        setHasMore(paginator ? paginator.current_page < paginator.last_page : false);
      })
      .catch(() => {
        setOrdersError("Could not load your orders. Please refresh and try again.");
      })
      .finally(() => {
        setOrdersLoading(false);
        setLoadingMore(false);
      });
  }, []);

  useEffect(() => {
    fetchOrders(1, false);
  }, [fetchOrders]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage, true);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (_) {
      // even if the request fails, still clear the local session
    }
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const navItems = [
    { id: "orders", label: "My Orders", icon: Package },
    { id: "profile", label: "Profile", icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin },
  ];

  return (
    <div className="ma-page">
      <div className="ma-container">
        <div className="ma-header">
          <h1 className="ma-title">My Account</h1>
          <span className="ma-brand-tag">Bzack Apparel</span>
        </div>

        <div className="ma-grid">
          {/* Sidebar */}
          <aside>
            <div className="ma-sidebar-card">
              {userLoading ? (
                <p className="ma-muted-text">Loading…</p>
              ) : userError ? (
                <p style={{ color: "var(--ma-rust)", fontSize: 14, margin: 0 }}>{userError}</p>
              ) : (
                <>
                  <div className="ma-avatar">{(user?.name || "?").charAt(0).toUpperCase()}</div>
                  <p className="ma-user-name">{user?.name}</p>
                  <p className="ma-user-email">{user?.email}</p>
                  {user?.created_at && (
                    <p className="ma-member-since">
                      Member since{" "}
                      {new Date(user.created_at).toLocaleDateString("en-GB", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </>
              )}
            </div>

            <nav className="ma-nav">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`ma-nav-item${active ? " active" : ""}`}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
              <button onClick={handleLogout} className="ma-nav-item logout">
                <LogOut size={16} />
                Logout
              </button>
            </nav>
          </aside>

          {/* Main content */}
          <main>
            {activeTab === "orders" && (
              <div>
                <h2 className="ma-section-title">My Orders</h2>

                {ordersLoading ? (
                  <p className="ma-muted-text">Loading your orders…</p>
                ) : ordersError ? (
                  <div className="ma-error-box">
                    <AlertCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                    {ordersError}
                  </div>
                ) : orders.length === 0 ? (
                  <EmptyOrders />
                ) : (
                  <>
                    <div className="ma-orders-list">
                      {orders.map((order) => (
                        <OrderTicket key={order.order_number} order={order} />
                      ))}
                    </div>
                    {hasMore && (
                      <div className="ma-load-more-wrap">
                        <button
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="ma-btn-outline"
                        >
                          {loadingMore ? "Loading…" : "Load more orders"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "profile" && <ProfileTab user={user} loading={userLoading} />}
            {activeTab === "addresses" && <AddressesTab />}
          </main>
        </div>
      </div>
    </div>
  );
}