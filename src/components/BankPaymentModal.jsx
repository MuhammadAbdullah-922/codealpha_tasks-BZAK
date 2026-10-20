import meezanQr from "../assets/meezan-bank-qr.jpeg";
import "../styles/BankPaymentModal.css";

const MERCHANT_TITLE = "BZAK";
const BANK_NAME = "Meezan Bank";

/**
 * Inline "Scan & Pay" modal — opens on top of Checkout, no page navigation.
 * Customer scans the real Meezan QR with their banking/JazzCash/EasyPaisa
 * app (which auto-fills the merchant and just asks them to enter the
 * amount and send), then types the transaction reference here and
 * confirms — placing the order immediately from the same screen.
 */
export default function BankPaymentModal({
  open,
  onClose,
  reference,
  onReferenceChange,
  onConfirm,
  confirming,
}) {
  if (!open) return null;

  return (
    <div className="bank-modal-overlay" onClick={onClose}>
      <div
        className="bank-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Pay via bank transfer"
      >
        <button
          type="button"
          className="bank-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h3 className="bank-modal-title">Scan & Pay</h3>
        <p className="bank-modal-subtitle">
          Scan with JazzCash, EasyPaisa, or your banking app — it'll open
          straight to the amount screen for {BANK_NAME}.
        </p>

        <div className="bank-modal-qr-wrapper">
          <img
            src={meezanQr}
            alt="Meezan Bank Scan & Pay QR code"
            className="bank-modal-qr-image"
          />
          <span className="bank-modal-merchant">{MERCHANT_TITLE}</span>
        </div>

        <label className="bank-modal-field">
          <span>Transaction Reference*</span>
          <input
            type="text"
            placeholder="Paste the reference from your payment receipt"
            value={reference}
            onChange={(e) => onReferenceChange(e.target.value)}
            autoFocus
          />
        </label>

        <button
          type="button"
          className="bank-modal-confirm-btn"
          onClick={onConfirm}
          disabled={confirming || !reference.trim()}
        >
          {confirming ? "Placing Order…" : "I've Paid — Place Order"}
        </button>

        <p className="bank-modal-note">
          We verify this reference against your payment before processing
          the order.
        </p>
      </div>
    </div>
  );
}