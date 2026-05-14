import React, { useState } from "react";
import { askQuery } from "../api/query";

const SUGGESTIONS = [
  "Show total donations by each donor",
  "Which programme has the highest expenditure?",
  "Show budget vs expenditure for all programmes",
  "Which donor contributed the most?",
  "Show all data",
];

function ResultTable({ data }) {
  if (!data || data.length === 0) return <p style={{ color: "var(--text-secondary)" }}>No results found.</p>;

  // If nested array, flatten first table
  const rows = Array.isArray(data[0]) ? data[0] : data;
  const cols = Object.keys(rows[0]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.95rem",
        fontFamily: "inherit",
      }}>
        <thead>
          <tr>
            {cols.map(col => (
              <th key={col} style={{
                textAlign: "left",
                padding: "0.75rem 1rem",
                background: "#eff6ff",
                color: "#1e40af",
                fontWeight: 600,
                borderBottom: "2px solid #bfdbfe",
                whiteSpace: "nowrap",
              }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
              {cols.map(col => (
                <td key={col} style={{
                  padding: "0.65rem 1rem",
                  borderBottom: "1px solid #e2e8f0",
                  color: "#334155",
                }}>
                  {typeof row[col] === "number"
                    ? row[col].toLocaleString("en-IN")
                    : row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function exportCSV(data) {
  const rows = Array.isArray(data[0]) ? data[0] : data;
  if (!rows || rows.length === 0) return;
  const cols = Object.keys(rows[0]);
  const csv = [cols.join(","), ...rows.map(r => cols.map(c => `"${r[c]}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "capitalize_report.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ChatInterface() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sqlUsed, setSqlUsed] = useState("");

  const sendQuery = async (q) => {
    const text = q || query;
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setResponse(null);
    setSqlUsed("");
    try {
      const res = await askQuery(text);
      setResponse(res.result || []);
      setSqlUsed(res.metadata?.sql_used || "");
    } catch (e) {
      setError("❌ Could not get a response. Make sure you've uploaded a file first.");
    }
    setLoading(false);
  };

  return (
    <div className="chat-container">
      <h3 style={{ marginBottom: "0.25rem" }}>Ask AI Analyst</h3>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1rem" }}>
        Pick a suggestion or type your own question below.
      </p>

      {/* Suggestion chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setQuery(s)}
            style={{
              padding: "0.4rem 0.85rem",
              borderRadius: "20px",
              border: "1px solid #bfdbfe",
              background: query === s ? "#2563eb" : "#eff6ff",
              color: query === s ? "#ffffff" : "#1e40af",
              fontSize: "0.85rem",
              cursor: "pointer",
              fontWeight: 500,
              transition: "all 0.15s ease",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="chat-input-area">
        <div className="input-group">
          <input
            placeholder="Type a question or pick one above..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendQuery()}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={() => sendQuery()}
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, whiteSpace: "nowrap" }}
        >
          {loading ? "Thinking..." : "Ask AI ✨"}
        </button>
      </div>

      {/* SQL used (collapsible hint) */}
      {sqlUsed && (
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "-0.5rem" }}>
          SQL used: <code style={{ background: "#f1f5f9", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>{sqlUsed}</code>
        </p>
      )}

      {/* Error */}
      {error && (
        <p style={{ color: "#ef4444", fontWeight: 600 }}>{error}</p>
      )}

      {/* Results */}
      {response !== null && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <p style={{ fontWeight: 600, color: "#1e293b" }}>
              Results{" "}
              <span style={{ color: "#64748b", fontWeight: 400, fontSize: "0.9rem" }}>
                ({Array.isArray(response[0]) ? response[0].length : response.length} rows)
              </span>
            </p>
            <button
              onClick={() => exportCSV(response)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "8px",
                border: "1px solid #bfdbfe",
                background: "#eff6ff",
                color: "#1e40af",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ⬇ Export CSV
            </button>
          </div>
          <div className="response-box" style={{ padding: "0", overflow: "hidden" }}>
            <ResultTable data={response} />
          </div>
        </div>
      )}
    </div>
  );
}
