"""
Build dashboard payload from an uploaded bank CSV/Excel.
Numeric series and top transactions are computed locally (deterministic).
Gemini is only used from the dashboard generate endpoint for narrative text.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

import numpy as np
import pandas as pd

from .credit_engine import (
    compute_credit_score,
    detect_columns,
    load_and_normalise,
    monthly_summary,
    _parse_amount,
    _parse_dates,
)


def _read_raw(filepath: Path) -> pd.DataFrame:
    suffix = filepath.suffix.lower()
    if suffix == ".csv":
        for enc in ["utf-8", "latin-1", "cp1252"]:
            try:
                df = pd.read_csv(filepath, encoding=enc, skip_blank_lines=True)
                break
            except UnicodeDecodeError:
                continue
        else:
            raise ValueError("Could not decode CSV.")
    elif suffix in [".xlsx", ".xls"]:
        df = pd.read_excel(filepath)
    else:
        raise ValueError(f"Unsupported file type: {suffix}")
    df.dropna(how="all", inplace=True)
    df.columns = [str(c).strip() for c in df.columns]
    return df


def _guess_description_col(df: pd.DataFrame, cols: dict) -> Optional[str]:
    reserved = {cols.get("date"), cols.get("credit"), cols.get("debit"), cols.get("amount")}
    reserved = {c for c in reserved if c}
    for name in (
        "Narration",
        "Description",
        "Particulars",
        "Remarks",
        "Details",
        "Transaction Particulars",
        "Transaction Remarks",
    ):
        if name in df.columns and name not in reserved:
            return name
    for c in df.columns:
        if c in reserved:
            continue
        if df[c].dtype == object or str(df[c].dtype) == "string":
            return c
    return None


def _enrich_raw(filepath: Path) -> tuple[pd.DataFrame, dict]:
    """Return raw rows with _date, _credit, _debit, _desc."""
    raw = _read_raw(filepath)
    cols = detect_columns(raw)

    if cols["date"]:
        raw["_date"] = _parse_dates(raw[cols["date"]])
    else:
        raw["_date"] = pd.Timestamp.today()

    if cols["credit"] and cols["debit"]:
        raw["_credit"] = _parse_amount(raw[cols["credit"]]).clip(lower=0)
        raw["_debit"] = _parse_amount(raw[cols["debit"]]).clip(lower=0)
    elif cols["amount"]:
        amounts = _parse_amount(raw[cols["amount"]])
        raw["_credit"] = amounts.clip(lower=0)
        raw["_debit"] = (-amounts).clip(lower=0)
    else:
        num_cols = raw.select_dtypes(include=[np.number]).columns.tolist()
        if not num_cols:
            raise ValueError("No numeric columns found.")
        amounts = raw[num_cols[0]].fillna(0)
        raw["_credit"] = amounts.clip(lower=0)
        raw["_debit"] = (-amounts).clip(lower=0)

    desc_col = _guess_description_col(raw, cols)
    raw["_desc"] = raw[desc_col].astype(str) if desc_col else "Transaction"

    out = raw.dropna(subset=["_date"]).copy()
    return out, cols


def _month_trend(current: float, previous: Optional[float]) -> str:
    if previous is None or previous == 0:
        return "—"
    pct = (current - previous) / abs(previous) * 100
    sign = "+" if pct >= 0 else ""
    return f"{sign}{pct:.1f}% vs prior month"


def _pillar_color(score: float, max_pts: float) -> str:
    pct = (score / max_pts) * 100 if max_pts else 0
    if pct >= 75:
        return "var(--color-success)"
    if pct >= 50:
        return "var(--color-primary)"
    return "var(--color-warning)"


def build_dashboard_bundle(filepath: Path) -> dict[str, Any]:
    """
    Deterministic dashboard metrics + structures for the React app.
    """
    credit = compute_credit_score(filepath)
    df_norm = load_and_normalise(filepath)
    monthly = monthly_summary(df_norm)
    enriched, bank_cols = _enrich_raw(filepath)

    enriched["_flow"] = enriched["_credit"] + enriched["_debit"]
    top = (
        enriched.sort_values("_flow", ascending=False)
        .head(8)
        .reset_index(drop=True)
    )

    transactions = []
    for i, row in top.iterrows():
        is_credit = row["_credit"] >= row["_debit"]
        amt = float(row["_credit"] if is_credit else row["_debit"])
        transactions.append(
            {
                "id": i + 1,
                "date": row["_date"].strftime("%d %b %Y"),
                "description": (row["_desc"] or "Transaction")[:120],
                "category": "Bank",
                "amount": round(amt, 2),
                "type": "Credit" if is_credit else "Debit",
                "status": "Credited" if is_credit else "Debited",
            }
        )

    # Last up to 8 month labels for chart
    tail = monthly.tail(8).copy()
    labels = [str(m) for m in tail["month"].astype(str)]
    revenue = [round(float(x), 2) for x in tail["total_credit"]]
    expenses = [round(float(x), 2) for x in tail["total_debit"]]

    last_net = float(tail["net"].iloc[-1]) if len(tail) else 0.0
    prev_net = float(tail["net"].iloc[-2]) if len(tail) > 1 else None
    last_cr = float(tail["total_credit"].iloc[-1]) if len(tail) else 0.0
    prev_cr = float(tail["total_credit"].iloc[-2]) if len(tail) > 1 else None
    last_db = float(tail["total_debit"].iloc[-1]) if len(tail) else 0.0
    prev_db = float(tail["total_debit"].iloc[-2]) if len(tail) > 1 else None

    pillars = []
    for key, comp in credit["components"].items():
        pillars.append(
            {
                "name": comp.get("label", key),
                "score": round(comp["score"]),
                "color": _pillar_color(comp["score"], comp["max"]),
            }
        )

    # Simple pseudo week bars from last 5 weekdays (aggregate last 5 rows by day name — lightweight viz)
    recent = enriched.sort_values("_date").tail(400)
    dow_net = recent.groupby(recent["_date"].dt.day_name(), observed=True)["_flow"].sum()
    order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    cash_bars = []
    mx = float(dow_net.max()) if len(dow_net) else 1.0
    mx = mx if mx > 0 else 1.0
    for day in order:
        v = float(dow_net.get(day, 0.0))
        cash_bars.append(
            {
                "day": day[:3],
                "inflowWidth": min(100, round(100 * max(v, 0) / mx)),
                "outflowWidth": min(100, round(100 * max(-v, 0) / mx)),
            }
        )

    dq = credit.get("data_quality") or {}
    months_n = dq.get("months_analyzed") or int(len(monthly))

    bundle = {
        "filename": filepath.name,
        "bank": bank_cols.get("bank"),
        "credit_score": credit["total_score"],
        "credit_score_max": 100,
        "credit_trend_label": _month_trend(last_net, prev_net),
        "headline": {
            "net_revenue": round(last_cr, 2),
            "net_revenue_trend": _month_trend(last_cr, prev_cr),
            "active_cash_flow": round(last_net, 2),
            "active_cash_flow_trend": _month_trend(last_net, prev_net),
        },
        "chart": {"labels": labels, "revenue": revenue, "expenses": expenses},
        "pillars": pillars,
        "transactions": transactions[:5],
        "cash_flow_bars": cash_bars,
        "months_analysed": months_n,
        "row_count": len(df_norm),
        "credit": credit,
        "ai": {
            "executive_summary": None,
            "recommendations": [],
            "from_cache": False,
            "gemini_skipped": False,
        },
    }
    return bundle


def facts_json_for_gemini(bundle: dict[str, Any]) -> str:
    """Small JSON blob for a single Gemini call (no raw CSV rows)."""
    slim = {
        "filename": bundle["filename"],
        "bank": bundle.get("bank"),
        "credit_score": bundle["credit_score"],
        "months_analysed": bundle["months_analysed"],
        "row_count": bundle["row_count"],
        "headline": bundle["headline"],
        "last_month_labels": bundle["chart"]["labels"][-3:],
        "last_month_revenue": bundle["chart"]["revenue"][-3:],
        "last_month_expenses": bundle["chart"]["expenses"][-3:],
        "pillar_names_and_scores": [
            {"name": p["name"], "score": p["score"]} for p in bundle["pillars"]
        ],
        "sample_descriptions": [t["description"] for t in bundle["transactions"][:5]],
    }
    return json.dumps(slim, indent=2)


def merge_ai_narrative(bundle: dict[str, Any], ai: dict[str, Any]) -> dict[str, Any]:
    out = dict(bundle)
    out["ai"] = {
        "executive_summary": ai.get("executive_summary"),
        "recommendations": ai.get("recommendations") or [],
        "from_cache": False,
        "gemini_skipped": ai.get("gemini_skipped", False),
    }
    return out
