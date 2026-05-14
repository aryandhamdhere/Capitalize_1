"""
credit_engine.py — Real credit score computation from uploaded bank CSV/Excel.

Pure Python + Pandas. No external API calls, no ML models.
Handles SBI, HDFC, ICICI formats + generic auto-detection.
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional


# ──────────────────────────────────────────────────────────────────────────────
# Bank format definitions
# ──────────────────────────────────────────────────────────────────────────────

BANK_FORMATS = {
    "SBI": {
        "date": "Txn Date",
        "credit": "Credit",
        "debit": "Debit",
    },
    "HDFC": {
        "date": "Date",
        "credit": "Deposit Amt",
        "debit": "Withdrawal Amt",
    },
    "ICICI": {
        "date": "Transaction Date",
        "credit": "Deposit Amount (INR )",
        "debit": "Withdrawal Amount (INR )",
    },
}

CREDIT_KEYWORDS  = ["credit", "deposit", "inflow", "receipt", "cr", "deposit amt", "deposit amount"]
DEBIT_KEYWORDS   = ["debit", "withdrawal", "outflow", "payment", "dr", "withdrawal amt", "withdrawal amount"]
DATE_KEYWORDS    = ["date", "time", "timestamp", "txn date", "value date", "transaction date"]
AMOUNT_KEYWORDS  = ["amount", "transaction amount", "txn amount", "net amount"]


# ──────────────────────────────────────────────────────────────────────────────
# Step 1 — Column Detection
# ──────────────────────────────────────────────────────────────────────────────

def _match_col(columns: list[str], keywords: list[str]) -> Optional[str]:
    """Return the first column whose lowercase name contains any keyword."""
    cols_lower = {c.lower().strip(): c for c in columns}
    for kw in keywords:
        for col_lower, col_orig in cols_lower.items():
            if kw in col_lower:
                return col_orig
    return None


def detect_columns(df: pd.DataFrame) -> dict:
    """
    Detect date, credit, debit (or single amount) columns.
    Returns a dict: {date, credit, debit, amount}
    Tries known bank formats first, then falls back to keyword scan.
    """
    cols = list(df.columns)

    # Try known bank formats
    for bank, fmt in BANK_FORMATS.items():
        if all(c in cols for c in fmt.values()):
            return {
                "bank": bank,
                "date": fmt["date"],
                "credit": fmt["credit"],
                "debit": fmt["debit"],
                "amount": None,
            }

    # Generic keyword scan
    date_col   = _match_col(cols, DATE_KEYWORDS)
    credit_col = _match_col(cols, CREDIT_KEYWORDS)
    debit_col  = _match_col(cols, DEBIT_KEYWORDS)
    amount_col = _match_col(cols, AMOUNT_KEYWORDS)

    return {
        "bank": "Generic",
        "date": date_col,
        "credit": credit_col,
        "debit": debit_col,
        "amount": amount_col,  # used when no separate credit/debit cols
    }


# ──────────────────────────────────────────────────────────────────────────────
# Step 2 — Load & Normalise
# ──────────────────────────────────────────────────────────────────────────────

def _parse_amount(series: pd.Series) -> pd.Series:
    """Clean currency strings → float. Handles '₹1,23,456.78', 'Dr', commas."""
    return (
        series.astype(str)
        .str.replace(r"[₹,\s]", "", regex=True)
        .str.replace(r"[Dd][Rr]$", "", regex=True)  # trailing "Dr"
        .str.replace(r"[Cc][Rr]$", "", regex=True)  # trailing "Cr"
        .replace("", "0")
        .replace("nan", "0")
        .apply(lambda x: float(x) if x.replace(".", "").replace("-", "").isdigit() else 0.0)
    )


def _parse_dates(series: pd.Series) -> pd.Series:
    """Try multiple date formats, fall back to pandas inference."""
    formats = ["%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d %b %Y",
               "%d/%m/%y", "%m/%d/%Y", "%d-%b-%Y"]
    for fmt in formats:
        try:
            parsed = pd.to_datetime(series, format=fmt, errors="coerce")
            if parsed.notna().sum() > len(series) * 0.7:
                return parsed
        except Exception:
            continue
    return pd.to_datetime(series, infer_datetime_format=True, errors="coerce")


def load_and_normalise(filepath: Path) -> pd.DataFrame:
    """
    Load CSV/Excel and return a normalised DataFrame with columns:
      date (datetime), credit (float), debit (float)
    """
    suffix = filepath.suffix.lower()
    if suffix == ".csv":
        # Try different encodings
        for enc in ["utf-8", "latin-1", "cp1252"]:
            try:
                df = pd.read_csv(filepath, encoding=enc, skip_blank_lines=True)
                break
            except UnicodeDecodeError:
                continue
    elif suffix in [".xlsx", ".xls"]:
        df = pd.read_excel(filepath)
    else:
        raise ValueError(f"Unsupported file type: {suffix}")

    # Drop fully empty rows/cols
    df.dropna(how="all", inplace=True)
    df.columns = [str(c).strip() for c in df.columns]

    cols = detect_columns(df)

    # ── Parse date ──
    if cols["date"]:
        df["_date"] = _parse_dates(df[cols["date"]])
    else:
        # No date column — create a dummy single-month date
        df["_date"] = pd.Timestamp.today()

    # ── Parse credit / debit ──
    if cols["credit"] and cols["debit"]:
        df["_credit"] = _parse_amount(df[cols["credit"]]).clip(lower=0)
        df["_debit"]  = _parse_amount(df[cols["debit"]]).clip(lower=0)
    elif cols["amount"]:
        amounts = _parse_amount(df[cols["amount"]])
        df["_credit"] = amounts.clip(lower=0)
        df["_debit"]  = (-amounts).clip(lower=0)
    else:
        # Last resort: try the first numeric column
        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        if not num_cols:
            raise ValueError("No numeric columns found — cannot compute credit score.")
        amounts = df[num_cols[0]].fillna(0)
        df["_credit"] = amounts.clip(lower=0)
        df["_debit"]  = (-amounts).clip(lower=0)

    return df[["_date", "_credit", "_debit"]].dropna(subset=["_date"])


# ──────────────────────────────────────────────────────────────────────────────
# Step 3 — Monthly Aggregation
# ──────────────────────────────────────────────────────────────────────────────

def monthly_summary(df: pd.DataFrame) -> pd.DataFrame:
    """
    Group transactions by month → DataFrame with columns:
      month, total_credit, total_debit, net
    """
    df = df.copy()
    df["month"] = df["_date"].dt.to_period("M")
    monthly = df.groupby("month").agg(
        total_credit=("_credit", "sum"),
        total_debit=("_debit", "sum"),
    ).reset_index()
    monthly["net"] = monthly["total_credit"] - monthly["total_debit"]
    monthly.sort_values("month", inplace=True)
    return monthly


# ──────────────────────────────────────────────────────────────────────────────
# Step 4 — Score Components
# ──────────────────────────────────────────────────────────────────────────────

def score_cash_flow_consistency(monthly: pd.DataFrame) -> dict:
    """
    30 points. Measures volatility of monthly net cash flow.
    Lower std deviation relative to mean → higher score.
    """
    if len(monthly) < 3:
        return {
            "score": round(10 * (len(monthly) / 3), 1),
            "max": 30,
            "insight": f"Only {len(monthly)} month(s) of data — insufficient for full analysis.",
        }

    net = monthly["net"]
    mean = net.mean()
    std  = net.std()

    if mean <= 0:
        score = 0.0
        insight = "Average net cash flow is negative — spending exceeds income consistently."
    else:
        ratio = min(std / abs(mean), 1.0)
        score = round(30 * (1 - ratio), 1)
        cv    = std / abs(mean)  # coefficient of variation
        if cv < 0.2:
            insight = f"Very consistent cash flow (CV={cv:.0%}) — strong indicator for lenders."
        elif cv < 0.5:
            insight = f"Moderate volatility (CV={cv:.0%}) — some months are significantly weaker."
        else:
            insight = f"High cash flow volatility (CV={cv:.0%}) — revenue is unpredictable month-to-month."

    return {"score": score, "max": 30, "insight": insight}


def score_revenue_growth_trend(monthly: pd.DataFrame) -> dict:
    """
    25 points. Measures average month-over-month growth in credits.
    Positive growth → higher score.
    """
    credits = monthly["total_credit"]

    if len(credits) < 2:
        return {
            "score": 10.0,
            "max": 25,
            "insight": "Not enough months to measure growth trend.",
        }

    mom_changes = credits.pct_change().dropna()
    mom_changes = mom_changes.replace([np.inf, -np.inf], np.nan).dropna()

    if len(mom_changes) == 0:
        return {"score": 10.0, "max": 25, "insight": "Unable to compute growth — constant revenue."}

    avg_growth = mom_changes.mean()
    # Formula: 25 * min(max((avg_growth + 0.1) / 0.2, 0), 1)
    score = round(25 * min(max((avg_growth + 0.1) / 0.2, 0), 1), 1)

    pct = f"{avg_growth:.1%}"
    if avg_growth > 0.05:
        insight = f"Strong growth — average {pct} MoM revenue increase over {len(credits)} months."
    elif avg_growth > 0:
        insight = f"Steady growth — average {pct} MoM increase. Consistent but slow."
    elif avg_growth > -0.05:
        insight = f"Near-flat revenue — average {pct} MoM change. Growth stagnant."
    else:
        insight = f"Revenue declining — average {pct} MoM. Last 2 months especially weak."

    return {"score": score, "max": 25, "insight": insight}


def score_debt_to_income(monthly: pd.DataFrame) -> dict:
    """
    25 points. Total debits / total credits over the full period.
    Lower ratio = higher score.
    """
    total_credit = monthly["total_credit"].sum()
    total_debit  = monthly["total_debit"].sum()

    if total_credit == 0:
        return {"score": 0.0, "max": 25, "insight": "No income detected — cannot compute ratio."}

    ratio = total_debit / total_credit
    score = round(max(25 * (1 - ratio), 0), 1)
    pct   = f"{ratio:.0%}"

    if ratio < 0.6:
        insight = f"Excellent — spending only {pct} of earnings. Strong savings buffer."
    elif ratio < 0.8:
        insight = f"Healthy — spending {pct} of earnings. Room to service debt comfortably."
    elif ratio < 1.0:
        insight = f"Stretched — spending {pct} of earnings. Little buffer for emergencies."
    else:
        insight = f"Critical — outflows exceed inflows ({pct} ratio). Operating at a loss."

    return {"score": score, "max": 25, "insight": insight}


def score_payment_regularity(df: pd.DataFrame) -> dict:
    """
    20 points. Measures consistency of transaction intervals.
    Consistent payment gaps (low std) → higher score.
    """
    df_sorted = df.sort_values("_date")

    # Large transactions = above 75th percentile of total flow
    flow      = df_sorted["_credit"] + df_sorted["_debit"]
    threshold = flow.quantile(0.75)
    large_txns = df_sorted[flow >= threshold]["_date"].reset_index(drop=True)

    if len(large_txns) < 3:
        return {
            "score": 12.0,
            "max": 20,
            "insight": "Too few large transactions to measure payment regularity.",
        }

    gaps     = large_txns.diff().dropna().dt.days
    avg_gap  = gaps.mean()
    std_gap  = gaps.std()

    score = round(20 * (1 - min(std_gap / 30, 1)), 1)
    score = max(score, 0)

    avg_str = f"{avg_gap:.0f}"
    std_str = f"{std_gap:.0f}"

    if std_gap < 5:
        insight = f"Excellent regularity — payments occur every ~{avg_str} days with very low variance."
    elif std_gap < 15:
        insight = f"Good regularity — avg {avg_str}-day payment cycle, ±{std_str} days variance."
    elif std_gap < 30:
        insight = f"Moderate irregularity — avg {avg_str}-day gaps but ±{std_str} days variance."
    else:
        insight = f"High irregularity — payment gaps vary widely (±{std_str} days). Reduces lender confidence."

    return {"score": score, "max": 20, "insight": insight}


# ──────────────────────────────────────────────────────────────────────────────
# Step 5 — Data Quality
# ──────────────────────────────────────────────────────────────────────────────

def assess_data_quality(df: pd.DataFrame, monthly: pd.DataFrame) -> dict:
    months       = len(monthly)
    transactions = len(df)

    if months >= 6 and transactions >= 50:
        confidence = "high"
    elif months >= 3 and transactions >= 20:
        confidence = "medium"
    else:
        confidence = "low"

    return {
        "months_analyzed": months,
        "total_transactions": transactions,
        "confidence": confidence,
    }


# ──────────────────────────────────────────────────────────────────────────────
# Step 6 — Top Improvement Tip
# ──────────────────────────────────────────────────────────────────────────────

IMPROVEMENT_TIPS = {
    "cash_flow_consistency": (
        "Smooth your cash flow by billing clients weekly instead of monthly. "
        "More consistent inflows can add up to 8 points to this component."
    ),
    "revenue_growth_trend": (
        "Two months of revenue growth above 5% MoM will significantly improve this score. "
        "Focus on reactivating lapsed customers or upselling to existing ones."
    ),
    "debt_to_income": (
        "Reducing your monthly operating expenses by 10–15% or collecting overdue receivables "
        "will improve your spending ratio and can add 5–8 points here."
    ),
    "payment_regularity": (
        "Reduce receivable collection time and standardise your supplier payment cycle. "
        "Predictable payment patterns can add 4–6 points to your payment regularity score."
    ),
}


def get_top_improvement(components: dict) -> str:
    """Return an actionable tip for the weakest component."""
    weakest = min(
        components.items(),
        key=lambda kv: kv[1]["score"] / kv[1]["max"]
    )
    return IMPROVEMENT_TIPS.get(weakest[0], "Upload more months of data to improve score accuracy.")


# ──────────────────────────────────────────────────────────────────────────────
# Main Entry Point
# ──────────────────────────────────────────────────────────────────────────────

def compute_credit_score(filepath: Path) -> dict:
    """
    Main function. Load file → normalise → score → return structured dict.

    Returns:
        {
            "total_score": int,
            "components": { ... },
            "data_quality": { ... },
            "top_improvement": str
        }
    """
    # Load and normalise
    df = load_and_normalise(filepath)

    # Monthly aggregation
    monthly = monthly_summary(df)

    # Score each component
    components = {
        "cash_flow_consistency": score_cash_flow_consistency(monthly),
        "revenue_growth_trend":  score_revenue_growth_trend(monthly),
        "debt_to_income":        score_debt_to_income(monthly),
        "payment_regularity":    score_payment_regularity(df),
    }

    # Add label for frontend display
    labels = {
        "cash_flow_consistency": "Cash Flow Consistency",
        "revenue_growth_trend":  "Revenue Growth Trend",
        "debt_to_income":        "Debt-to-Income Ratio",
        "payment_regularity":    "Payment Regularity",
    }
    for key in components:
        components[key]["label"] = labels[key]
        components[key]["pct"]   = round(
            (components[key]["score"] / components[key]["max"]) * 100
        )

    # Total score
    total = round(sum(c["score"] for c in components.values()))
    total = min(max(total, 0), 100)

    return {
        "total_score": total,
        "components": components,
        "data_quality": assess_data_quality(df, monthly),
        "top_improvement": get_top_improvement(components),
    }
