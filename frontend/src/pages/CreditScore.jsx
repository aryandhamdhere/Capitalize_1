import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { sharmaData } from "../data/sampleData";
import EmptyState from "../components/EmptyState";
import { useData } from "../context/DataContext";
import { formatINR } from "../utils/formatters";

const BASE = "http://localhost:8000/api";
const DEMO  = sharmaData.scores;

const TIPS = {
  cash_flow_consistency: "Maintain positive cash flow for 3+ consecutive months.",
  revenue_growth_trend:  "10% MoM revenue growth for 2 quarters boosts this significantly.",
  debt_to_income:        "Reduce outstanding debt or increase monthly revenue.",
  payment_regularity:    "Standardise payment cycles — weekly billing improves this fast.",
};

// ── Animated arc gauge ──────────────────────────────────────────────────────
function ArcGauge({ score, size = 140, loading = false }) {
  const r   = size * 0.38;
  const cx  = size / 2;
  const cy  = size * 0.5;
  const circ = Math.PI * r;
  const pct  = loading ? 0 : score / 100;
  const color = score >= 75 ? "#2B84EA" : score >= 50 ? "#F59E0B" : "#EF4444";
  const label = score >= 75 ? "Good" : score >= 50 ? "Fair" : "Needs Work";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
      <svg width={size} height={size * 0.62} viewBox={`0 0 ${size} ${size * 0.62}`}>
        {/* Track */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke="#E2E8F0" strokeWidth="13" strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={loading ? "#E2E8F0" : color}
          strokeWidth="13" strokeLinecap="round"
          strokeDasharray={`${circ * pct} ${circ}`}
          style={{ transition: "stroke-dasharray 1.1s ease, stroke 0.4s" }}
        />
        {/* Score text */}
        <text
          x={cx} y={cy - 4}
          textAnchor="middle"
          fontSize={size * 0.2}
          fontWeight="700"
          fill="#02042B"
          fontFamily="Poppins, sans-serif"
        >
          {loading ? "…" : score}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={size * 0.08} fill="#94A3B8">
          /100
        </text>
      </svg>
      {!loading && (
        <div style={{ fontSize: "0.9rem", fontWeight: 700, color }}>{label}</div>
      )}
    </div>
  );
}

// ── Component bar ────────────────────────────────────────────────────────────
function ComponentBar({ label, score, max, insight, tip }) {
  const pct   = Math.round((score / max) * 100);
  const color  = pct >= 75 ? "#2B84EA" : pct >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="credit-component">
      <div className="credit-comp-header">
        <span className="credit-comp-label">{label}</span>
        <span className="credit-comp-score" style={{ color }}>
          {Math.round(score)}/{max}
        </span>
      </div>
      <div className="credit-bar-bg">
        <div
          className="credit-bar-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }}
        />
      </div>
      <div className="credit-comp-tip" style={{ color: "#4A5568", marginTop: "0.2rem" }}>
        {insight || `💡 ${tip}`}
      </div>
    </div>
  );
}

// ── Data quality badge ───────────────────────────────────────────────────────
function QualityBadge({ confidence, months, transactions }) {
  const colors = { high: "#2B84EA", medium: "#F59E0B", low: "#EF4444" };
  const color  = colors[confidence] || "#94A3B8";
  return (
    <div style={{
      display: "flex", gap: "1rem", flexWrap: "wrap",
      background: "#f8fafc", borderRadius: "10px", padding: "0.85rem 1rem",
      fontSize: "0.82rem", color: "#4A5568",
    }}>
      <span>📅 <strong>{months}</strong> months analysed</span>
      <span>📋 <strong>{transactions}</strong> transactions</span>
      <span style={{ marginLeft: "auto", fontWeight: 700, color }}>
        ● {confidence.charAt(0).toUpperCase() + confidence.slice(1)} confidence
      </span>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function CreditScore() {
  const navigate = useNavigate();
  const [liveScore, setLiveScore]       = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [usingLive, setUsingLive]       = useState(false);

  const { uploadedFile } = useData();
  const storedFile = uploadedFile || localStorage.getItem("capitalize_last_file");

  // Active data — live if available, demo otherwise
  const data       = liveScore || null;
  const components = data
    ? data.components
    : {
        cash_flow_consistency: { ...DEMO.components.cashFlow,      label: "Cash Flow Consistency", pct: DEMO.components.cashFlow.pct      },
        revenue_growth_trend:  { ...DEMO.components.revenueGrowth, label: "Revenue Growth Trend",  pct: DEMO.components.revenueGrowth.pct },
        debt_to_income:        { ...DEMO.components.debtIncome,    label: "Debt-to-Income Ratio",  pct: DEMO.components.debtIncome.pct    },
        payment_regularity:    { ...DEMO.components.vintage,       label: "Payment Regularity",    pct: DEMO.components.vintage.pct       },
      };
  const totalScore = data ? data.total_score : DEMO.credit;

  const calculateScore = async () => {
    if (!storedFile) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${BASE}/credit/score`, { filename: storedFile });
      setLiveScore(res.data);
      setUsingLive(true);
      // Persist to sidebar
      localStorage.setItem("capitalize_credit_score", String(res.data.total_score));
    } catch (err) {
      const detail = err?.response?.data?.detail || err.message || "Scoring failed.";
      setError(`❌ ${detail}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <div className="topbar-title">Credit Readiness Score</div>
          <div className="topbar-sub">
            {usingLive
              ? `📊 Live · ${storedFile}`
              : "📋 Demo data · Sharma Traders"}
          </div>
        </div>
        <div className="topbar-actions">
          {storedFile && !usingLive && (
            <button
              className="btn btn-outline btn-sm"
              onClick={calculateScore}
              disabled={loading}
            >
              {loading ? "Calculating…" : "📊 Calculate from my data"}
            </button>
          )}
          {usingLive && (
            <span className="badge badge-green" style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}>
              ✅ Live Score
            </span>
          )}
          {/* LEGAL: re-enable post-licensing 
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/loans")}>
            View Loan Options →
          </button>
          */}
        </div>
      </div>

      <div className="page-body" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

        {!storedFile ? (
          <EmptyState 
            icon="🎯"
            title="Calculate your credit score"
            subtitle="Upload a bank statement to get your personalized credit readiness score across 4 financial dimensions"
            ctaText="Upload Data"
            ctaAction={() => navigate("/onboarding")}
          />
        ) : (
          <>
            {/* Error */}
        {error && (
          <div style={{
            background: "#fee2e2", border: "1px solid #fca5a5",
            borderRadius: "10px", padding: "0.85rem 1.25rem",
            fontSize: "0.88rem", color: "#991b1b",
          }}>
            {error}
          </div>
        )}

        {/* Score Overview */}
        <div className="grid-2">

          {/* Left — Score */}
          <div className="card" style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: "1.25rem", padding: "2rem",
          }}>
            <div className="card-title">Overall Credit Readiness</div>

            <ArcGauge score={loading ? 0 : totalScore} loading={loading} size={160} />

            {/* Data quality (only when live) */}
            {data?.data_quality && (
              <QualityBadge {...data.data_quality} />
            )}

            {/* Static stats when using demo */}
            {!data && (
              <div style={{
                background: "#eff6ff", borderRadius: "10px", padding: "1rem",
                fontSize: "0.85rem", color: "#1e40af", lineHeight: 1.6, width: "100%",
                textAlign: "center",
              }}>
                {/* LEGAL: re-enable post-licensing
                Pre-approved for loans up to <strong>₹15L</strong> from select NBFCs.<br />
                Improve cash flow score to unlock ₹25L+.
                */}
                Your credit readiness score helps lenders understand your business — not an official credit rating
              </div>
            )}

            {/* Live improvement tip */}
            {data?.top_improvement && (
              <div style={{
                background: "#f0fdf9", borderRadius: "10px", padding: "1rem",
                fontSize: "0.85rem", color: "#065f46", lineHeight: 1.6, width: "100%",
                borderLeft: "4px solid #2B84EA",
              }}>
                <strong>Top tip to improve:</strong><br />
                {data.top_improvement}
              </div>
            )}

            {storedFile && (
              <button
                className="btn btn-primary btn-lg"
                style={{ width: "100%" }}
                onClick={usingLive ? () => navigate("/loans") : calculateScore}
                disabled={loading}
              >
                {loading
                  ? "Analysing your data…"
                  : usingLive
                  ? "View Credit Details →"
                  : "📊 Calculate from My Data"}
              </button>
            )}
            {/* LEGAL: re-enable post-licensing
            {!storedFile && (
              <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={() => navigate("/loans")}>
                See Loan Options →
              </button>
            )}
            */}
          </div>

          {/* Right — Components */}
          <div className="card">
            <div className="card-title">Score Breakdown</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {Object.entries(components).map(([key, comp]) => (
                <ComponentBar
                  key={key}
                  label={comp.label || key}
                  score={comp.score}
                  max={comp.max}
                  insight={comp.insight}
                  tip={TIPS[key]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* How to Improve */}
        <div className="card">
          <div className="card-title">🚀 How to Improve Your Score</div>
          <div className="grid-3">
            {[
              {
                icon: "📅",
                title: "File GST on time",
                desc: "Filing 3 consecutive GST returns on time can add up to 8 points.",
                impact: "+8 pts",
              },
              {
                icon: "💸",
                title: "Collect overdue payments",
                desc: "Reducing receivable days from 42 to under 30 improves cash flow component.",
                impact: "+6 pts",
              },
              {
                icon: "📈",
                title: "Grow revenue 2 months",
                desc: "Two months of revenue above ₹4L restores your growth score component.",
                impact: "+5 pts",
              },
            ].map(tip => (
              <div key={tip.title} className="card" style={{
                borderLeft: "4px solid #2B84EA",
                background: "#f9fffe",
                boxShadow: "none",
              }}>
                <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{tip.icon}</div>
                <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>{tip.title}</div>
                <div style={{ fontSize: "0.83rem", color: "#4A5568", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                  {tip.desc}
                </div>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#1161C8" }}>
                  Impact: {tip.impact}
                </div>
              </div>
            ))}
          </div>
        </div>
        
          </>
        )}
      </div>
      
      {/* Disclaimer */}
      <div style={{ fontSize: "11px", color: "var(--text-3)", textAlign: "center", marginTop: "2rem", paddingBottom: "2rem" }}>
        For informational purposes only. Not a SEBI/RBI regulated service.
      </div>
    </>
  );
}
