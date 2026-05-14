import React from "react";

export default function EmptyState({ icon, title, subtitle, ctaText, ctaAction }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100%",
      minHeight: "400px",
      border: "2px dashed var(--border)",
      borderRadius: "12px",
      padding: "48px 32px",
      backgroundColor: "var(--surface)",
      textAlign: "center"
    }}>
      <div style={{ fontSize: "48px", marginBottom: "1rem" }}>{icon}</div>
      <h3 style={{ fontSize: "18px", color: "var(--text-1)", fontWeight: 600, marginBottom: "0.5rem" }}>
        {title}
      </h3>
      <p style={{ fontSize: "14px", color: "var(--text-3)", maxWidth: "280px", marginBottom: ctaText ? "1.5rem" : "0", lineHeight: 1.5 }}>
        {subtitle}
      </p>
      {ctaText && ctaAction && (
        <button className="btn btn-primary" onClick={ctaAction}>
          {ctaText}
        </button>
      )}
    </div>
  );
}
