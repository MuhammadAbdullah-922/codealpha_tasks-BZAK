import React from "react";
import { FaWhatsapp } from "react-icons/fa";

// Apna WhatsApp business number yahan set karein.
// Format: country code + number, bina + / 0 / spaces / dashes ke.
// Pakistan example: 0315-7724828 -> 923157724828
const WHATSAPP_NUMBER = "923157724828";

// Optional: jab user click kare to ye pre-filled message WhatsApp mein aa jayega
const DEFAULT_MESSAGE = "Hi! I have a question about your products.";

const WhatsAppButton = ({ message = DEFAULT_MESSAGE }) => {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        background: "#25D366",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        zIndex: 9999,
        textDecoration: "none",
      }}
    >
      <FaWhatsapp size={30} color="#fff" />
    </a>
  );
};

export default WhatsAppButton;