import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import meezanQr from "../assets/meezan-bank-qr.jpeg";
import "../styles/Bankpaymentdetails.css";
// Read from the "Scan & Pay" card. This is a merchant Scan-and-Pay QR,
// not a plain IBAN — customers pay by scanning it with their own
// banking / JazzCash / EasyPaisa app, no manual account entry needed.
const MERCHANT_TITLE = "BZAK";
const BANK_NAME = "Meezan Bank";
const TERMINAL_ID = "10495199";

// Optional manual fallback for apps that can't scan merchant QR codes.
// Leave blank (or remove the row below) if you don't want to expose a
// manual account number — fill in once you have it from the bank.
const ACCOUNT_NUMBER = ""; // e.g. "PK00MEZN0000000000000000"

export default function BankPaymentDetails() {
  const navigate = useNavigate();

  const copyToClipboard = async (value, label) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      Swal.fire({
        icon: "success",
        title: "Copied",
        text: `${label} copied to clipboard.`,
        confirmButtonColor: "#000",
        timer: 1200,
        showConfirmButton: false,
      });
    } catch {
      // Clipboard API unavailable — fail silently, value is still visible on screen.
    }
  };

  return (
    <div className="bank-details-page">
      <div className="bank-details-card">
        <button
          type="button"
          className="bank-details-back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="bank-details-card__header">
          <h1>Pay via Meezan Bank</h1>
          <p>
            Scan the code below with your JazzCash, EasyPaisa, or banking
            app to pay directly — no need to enter any details manually.
          </p>
        </div>

        <div className="bank-details-qr-wrapper">
          <img
            src={meezanQr}
            alt="Meezan Bank Scan & Pay QR code"
            className="bank-details-qr-image"
          />
        </div>

        <div className="bank-details-list">
          <div className="bank-details-row">
            <div className="bank-details-row__text">
              <span className="bank-details-row__label">Bank</span>
              <span className="bank-details-row__value">{BANK_NAME}</span>
            </div>
          </div>

          <div className="bank-details-row">
            <div className="bank-details-row__text">
              <span className="bank-details-row__label">Merchant Title</span>
              <span className="bank-details-row__value">{MERCHANT_TITLE}</span>
            </div>
            <button
              type="button"
              className="bank-details-copy-btn"
              onClick={() => copyToClipboard(MERCHANT_TITLE, "Merchant title")}
            >
              Copy
            </button>
          </div>

          <div className="bank-details-row">
            <div className="bank-details-row__text">
              <span className="bank-details-row__label">Terminal ID (TID)</span>
              <span className="bank-details-row__value">{TERMINAL_ID}</span>
            </div>
            <button
              type="button"
              className="bank-details-copy-btn"
              onClick={() => copyToClipboard(TERMINAL_ID, "Terminal ID")}
            >
              Copy
            </button>
          </div>

          {ACCOUNT_NUMBER && (
            <div className="bank-details-row">
              <div className="bank-details-row__text">
                <span className="bank-details-row__label">Account Number</span>
                <span className="bank-details-row__value">{ACCOUNT_NUMBER}</span>
              </div>
              <button
                type="button"
                className="bank-details-copy-btn"
                onClick={() => copyToClipboard(ACCOUNT_NUMBER, "Account number")}
              >
                Copy
              </button>
            </div>
          )}
        </div>

        <p className="bank-details-note">
          Paid on your phone but started checkout on another device? Go
          back to that device's checkout tab, enter the transaction
          reference from your receipt, and place your order there — this
          page can't submit the order for you since it doesn't have your
          cart or billing details.
        </p>

        <button
          type="button"
          className="bank-details-back-btn bank-details-back-btn--bottom"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}