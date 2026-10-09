import { MessageCircle } from "lucide-react";

import "./WhatsAppChat.css";

function WhatsAppChat() {
  // WhatsApp number: country code + number, without +, spaces, or dashes.
  const whatsappNumber = "919800070855";

  const message =
    "Hello Builder 360! I would like to enquire about your construction and infrastructure services.";

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message,
  )}`;

  const handleChat = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="whatsapp-widget">
      <button
        type="button"
        className="whatsapp-floating-button"
        onClick={handleChat}
        aria-label="Chat with Builder 360 on WhatsApp"
      >
        <MessageCircle size={28} />

        <span className="whatsapp-button-label">Chat with us</span>

        <span className="whatsapp-pulse" />
      </button>
    </div>
  );
}

export default WhatsAppChat;
