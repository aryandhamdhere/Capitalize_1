import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Toast({ message, type = "success", showLink = false, onClose }) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for transition
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      backgroundColor: type === "success" ? "var(--green, #00C48C)" : "var(--red, #EF4444)",
      color: "white",
      padding: "1rem 1.5rem",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      fontWeight: 500,
      fontSize: "0.95rem",
      transform: visible ? "translateX(0)" : "translateX(120%)",
      transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    }}>
      <div>{message}</div>
      {showLink && (
        <button 
          onClick={() => { setVisible(false); navigate("/dashboard"); onClose(); }}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}
        >
          View Dashboard →
        </button>
      )}
    </div>
  );
}
