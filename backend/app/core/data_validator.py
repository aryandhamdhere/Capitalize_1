"""
data_validator.py — Pre-indexing validation and normalisation pipeline.

Runs BEFORE data_indexer.py in the upload pipeline.
Pure Python + Pandas. No API calls, no new packages.

Pipeline:
  1. detect_file_type(df)       → classify what was uploaded
  2. normalize_schema(df)       → standardise column names across banks
  3. score_data_quality(df_raw, df_norm) → assess and clean data
"""

import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional


# ─────────────────────────────────────────────────────────────────────────────
# Keyword sets for generic detection
# ─────────────────────────────────────────────────────────────────────────────

_DATE_KW     = {"date", "time", "timestamp", "txn date", "value date",
                "transaction date", "tran date", "posting date", "entry date"}
_DEBIT_KW    = {"debit", "withdrawal", "dr", "outflow", "payment", "paid",
                "withdrawal amt", "withdrawal amount"}
_CREDIT_KW   = {"credit", "deposit", "cr", "inflow", "receipt", "received",
                "deposit amt", "deposit amount"}
_BALANCE_KW  = {"balance", "bal", "closing balance", "closing bal", "running balance"}
_AMOUNT_KW   = {"amount", "transaction amount", "txn amount", "net amount", "value"}
_GSTIN_KW    = {"gstin", "gst number", "taxpayer gstin"}
_GST_TAX_KW  = {"igst", "cgst", "sgst", "cess", "taxable value", "taxable amount"}
_INVOICE_KW  = {"invoice", "inv no", "invoice number", "bill no"}
_PARTY_KW    = {"party", "customer", "vendor", "buyer", "supplier", "client"}
_CATEGORY_KW = {"category", "expense category", "type", "head"}


def _cols_lower(df: pd.DataFrame) -> dict:
    """Return {lowercase_stripped_name: original_name} mapping."""
    return {c.lower().strip(): c for c in df.columns}


def _has_any(col_map: dict, keywords: set) -> bool:
    return any(any(kw in col for kw in keywords) for col in col_map)


def _find_col(col_map: dict, keywords: set) -> Optional[str]:
    """Return first original column name whose lowercase matches any keyword."""
    for col_low, col_orig in col_map.items():
        if any(kw in col_low for kw in keywords):
            return col_orig
    return None


# ─────────────────────────────────────────────────────────────────────────────
# Part 1 — File Type Detection
# ─────────────────────────────────────────────────────────────────────────────

def detect_file_type(df: pd.DataFrame) -> str:
    """
    Classify the uploaded file into one of:
      "bank_statement" | "gst_export" | "sales_ledger" |
      "expense_sheet"  | "unknown"
    """
    cm = _cols_lower(df)

    has_date    = _has_any(cm, _DATE_KW)
    has_balance = _has_any(cm, _BALANCE_KW)
    has_debit   = _has_any(cm, _DEBIT_KW)
    has_credit  = _has_any(cm, _CREDIT_KW)
    has_amount  = _has_any(cm, _AMOUNT_KW)
    has_money   = has_debit or has_credit or has_amount

    # GST export: GSTIN column or (IGST + CGST present)
    if _has_any(cm, _GSTIN_KW) or (
        any("igst" in c for c in cm) and any("cgst" in c for c in cm)
    ):
        return "gst_export"

    # Bank statement: date + money + balance
    if has_date and has_money and has_balance:
        return "bank_statement"

    # Sales ledger: party/customer + invoice + amount (no balance)
    if _has_any(cm, _PARTY_KW) and _has_any(cm, _INVOICE_KW) and has_money:
        return "sales_ledger"

    # Expense sheet: category + amount, NO balance
    if _has_any(cm, _CATEGORY_KW) and has_money and not has_balance:
        return "expense_sheet"

    # Bank-like but missing balance (some exports strip it)
    if has_date and has_money:
        return "bank_statement"

    return "unknown"


# ─────────────────────────────────────────────────────────────────────────────
# Part 2 — Schema Normalisation
# ─────────────────────────────────────────────────────────────────────────────

# Each bank definition: list of candidate column names per field (in priority order)
_BANK_DEFS = {
    "SBI": {
        "date":        ["Txn Date", "Transaction Date", "Date"],
        "description": ["Description", "Narration", "Particulars"],
        "debit":       ["Debit", "Withdrawal Amt", "DR"],
        "credit":      ["Credit", "Deposit Amt", "CR"],
        "balance":     ["Balance", "Closing Balance", "BAL"],
    },
    "HDFC": {
        "date":        ["Date", "Value Dt", "Value Date"],
        "description": ["Narration", "Description", "Particulars"],
        "debit":       ["Withdrawal Amt (INR)", "Withdrawal Amt", "Debit Amount", "Debit"],
        "credit":      ["Deposit Amt (INR)", "Deposit Amt", "Credit Amount", "Credit"],
        "balance":     ["Closing Balance (INR)", "Closing Balance", "Balance"],
    },
    "ICICI": {
        "date":        ["Transaction Date", "Value Date", "Date"],
        "description": ["Transaction Remarks", "Narration", "Description"],
        "debit":       ["Withdrawal Amount (INR )", "Withdrawal Amount (INR)", "Withdrawal Amount", "Debit"],
        "credit":      ["Deposit Amount (INR )", "Deposit Amount (INR)", "Deposit Amount", "Credit"],
        "balance":     ["Balance (INR )", "Balance (INR)", "Balance"],
    },
    "AXIS": {
        "date":        ["Tran Date", "Transaction Date", "Date"],
        "description": ["PARTICULARS", "Narration", "Description"],
        "debit":       ["DR", "Debit", "Withdrawal"],
        "credit":      ["CR", "Credit", "Deposit"],
        "balance":     ["BAL", "Balance", "Closing Balance"],
    },
}


def _resolve_col(df: pd.DataFrame, candidates: list[str]) -> Optional[str]:
    """Return the first candidate column that actually exists in df."""
    for c in candidates:
        if c in df.columns:
            return c
    return None


def _detect_bank(df: pd.DataFrame) -> Optional[str]:
    """Return bank name if all required fields match, else None."""
    for bank, fields in _BANK_DEFS.items():
        matched = sum(
            1 for field, candidates in fields.items()
            if _resolve_col(df, candidates) is not None
        )
        if matched >= 4:          # need at least 4/5 fields to confirm bank
            return bank
    return None


def _parse_amount_series(s: pd.Series) -> pd.Series:
    """Clean ₹, commas, 'Dr'/'Cr' suffixes → float.
    Handles columns that arrive as float (NaN cells from CSV) or string."""
    # If already numeric, just fill NaN and clip
    if pd.api.types.is_numeric_dtype(s):
        return s.fillna(0.0).clip(lower=0)

    return (
        s.astype(str)
         .str.replace(r"[₹,\s]", "", regex=True)
         .str.replace(r"(?i)(dr|cr)$", "", regex=True)
         .replace({"": "0", "nan": "0", "NaN": "0", "-": "0"})
         .apply(lambda x: float(x) if x.replace(".", "").replace("-", "").isdigit() else np.nan)
         .fillna(0.0)
         .clip(lower=0)
    )


def _parse_dates(s: pd.Series) -> pd.Series:
    fmts = ["%d/%m/%Y", "%d-%m-%Y", "%Y-%m-%d", "%d/%m/%y",
            "%d %b %Y", "%d-%b-%Y", "%m/%d/%Y"]
    for fmt in fmts:
        try:
            parsed = pd.to_datetime(s, format=fmt, errors="coerce")
            if parsed.notna().sum() > len(s) * 0.6:
                return parsed
        except Exception:
            continue
    return pd.to_datetime(s, infer_datetime_format=True, errors="coerce")


def normalize_schema(df: pd.DataFrame) -> tuple[pd.DataFrame, str]:
    """
    Normalise any bank statement into standard schema:
      date | description | debit | credit | balance

    Returns: (normalised_df, bank_name_str)
    """
    bank = _detect_bank(df)
    issues = []

    if bank:
        fields = _BANK_DEFS[bank]
        date_col   = _resolve_col(df, fields["date"])
        desc_col   = _resolve_col(df, fields["description"])
        debit_col  = _resolve_col(df, fields["debit"])
        credit_col = _resolve_col(df, fields["credit"])
        bal_col    = _resolve_col(df, fields["balance"])
    else:
        # Generic fallback
        bank       = "generic"
        cm         = _cols_lower(df)
        date_col   = _find_col(cm, _DATE_KW)
        desc_col   = _find_col(cm, {"narration", "description", "particulars", "remarks", "details"})
        debit_col  = _find_col(cm, _DEBIT_KW)
        credit_col = _find_col(cm, _CREDIT_KW)
        bal_col    = _find_col(cm, _BALANCE_KW)

    out = pd.DataFrame()

    # date
    out["date"] = _parse_dates(df[date_col]) if date_col else pd.NaT

    # description
    out["description"] = df[desc_col].astype(str) if desc_col else ""

    # debit / credit
    if debit_col and credit_col:
        out["debit"]  = _parse_amount_series(df[debit_col])
        out["credit"] = _parse_amount_series(df[credit_col])
    else:
        # Try single amount column
        amount_col = _find_col(_cols_lower(df), _AMOUNT_KW)
        if amount_col:
            amounts   = df[amount_col].astype(str).str.replace(r"[₹,\s]", "", regex=True)
            amounts   = pd.to_numeric(amounts, errors="coerce").fillna(0)
            out["credit"] = amounts.clip(lower=0)
            out["debit"]  = (-amounts).clip(lower=0)
        else:
            out["debit"]  = 0.0
            out["credit"] = 0.0
            issues.append("Could not find debit/credit columns — amounts set to 0.")

    # balance
    out["balance"] = _parse_amount_series(df[bal_col]) if bal_col else 0.0

    # Drop rows where both debit and credit are 0 AND date is NaT (header garbage)
    out = out[~((out["debit"] == 0) & (out["credit"] == 0) & out["date"].isna())]
    out.reset_index(drop=True, inplace=True)

    return out, bank


# ─────────────────────────────────────────────────────────────────────────────
# Part 3 — Data Quality Scoring
# ─────────────────────────────────────────────────────────────────────────────

def score_data_quality(df_raw: pd.DataFrame, df_norm: pd.DataFrame) -> dict:
    """
    Assess data quality of the normalised DataFrame.
    Returns a dict with quality_score, issues, row counts, date range, confidence.
    """
    rows_before = len(df_raw)
    issues      = []
    score       = 100.0

    work = df_norm.copy()

    # ── Duplicates ──────────────────────────────────────────────────────────
    dup_count = work.duplicated().sum()
    if dup_count > 0:
        work = work.drop_duplicates()
        score -= 5
        issues.append(f"{dup_count} duplicate transaction{'s' if dup_count > 1 else ''} removed.")

    # ── Missing dates ────────────────────────────────────────────────────────
    missing_date_pct = work["date"].isna().mean() * 100 if "date" in work.columns else 0
    if missing_date_pct > 0:
        # Forward-fill then backward-fill as best guess
        work["date"] = work["date"].ffill().bfill()
        deduction = min(missing_date_pct * 2, 30)
        score -= deduction
        issues.append(
            f"{missing_date_pct:.0f}% of dates were missing — "
            f"filled using nearest neighbour."
        )

    # ── Missing / non-numeric amounts ────────────────────────────────────────
    for col in ["debit", "credit"]:
        if col not in work.columns:
            continue
        non_numeric = pd.to_numeric(work[col], errors="coerce").isna().sum()
        pct = (non_numeric / len(work) * 100) if len(work) > 0 else 0
        if pct > 0:
            work = work[pd.to_numeric(work[col], errors="coerce").notna()]
            score -= min(pct * 3, 20)
            issues.append(
                f"{non_numeric} non-numeric value{'s' if non_numeric > 1 else ''} "
                f"in '{col}' column — rows dropped."
            )

    # ── Date range & months ───────────────────────────────────────────────────
    valid_dates = work["date"].dropna() if "date" in work.columns else pd.Series(dtype="datetime64[ns]")
    if len(valid_dates) > 0:
        date_min      = valid_dates.min()
        date_max      = valid_dates.max()
        months_covered = max(
            int((date_max.year - date_min.year) * 12 + (date_max.month - date_min.month) + 1),
            1
        )
        date_range = {
            "from": date_min.strftime("%Y-%m-%d"),
            "to":   date_max.strftime("%Y-%m-%d"),
        }
    else:
        months_covered = 0
        date_range     = {"from": None, "to": None}
        issues.append("No valid dates found — date range unavailable.")

    if months_covered < 3:
        score -= 20
        issues.append(
            f"Only {months_covered} month(s) of data — "
            f"at least 3 months needed for reliable scoring."
        )

    rows_after  = len(work)
    score       = max(round(score), 0)
    confidence  = "high" if score > 80 else "medium" if score >= 50 else "low"

    return {
        "quality_score":  score,
        "issues":         issues,
        "rows_before":    rows_before,
        "rows_after":     rows_after,
        "date_range":     date_range,
        "months_covered": months_covered,
        "confidence":     confidence,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Public entry point — called by upload.py
# ─────────────────────────────────────────────────────────────────────────────

def validate_and_normalise(df_raw: pd.DataFrame, upload_dir: Path, stem: str) -> dict:
    """
    Full validation pipeline. Safe — never raises; returns partial results on error.

    Returns:
        {
            "file_type": str,
            "bank_detected": str | None,
            "quality": dict,
            "df_to_index": pd.DataFrame,       # normalised (or raw on failure)
            "normalised_path": Path | None,     # path of _normalized.csv if saved
        }
    """
    result = {
        "file_type":       "unknown",
        "bank_detected":   None,
        "quality":         {},
        "df_to_index":     df_raw,
        "normalised_path": None,
    }

    try:
        file_type = detect_file_type(df_raw)
        result["file_type"] = file_type

        if file_type == "bank_statement":
            df_norm, bank = normalize_schema(df_raw)
            result["bank_detected"] = bank

            # Save normalised CSV alongside original
            norm_path = upload_dir / f"{stem}_normalized.csv"
            df_norm.to_csv(norm_path, index=False)
            result["normalised_path"] = norm_path
            result["df_to_index"]    = df_norm

            quality = score_data_quality(df_raw, df_norm)
        else:
            # For non-bank files, score quality on raw data
            quality = score_data_quality(df_raw, df_raw)

        result["quality"] = quality

    except Exception as exc:
        # Never block the upload — just log what went wrong
        result["quality"] = {
            "quality_score":  50,
            "issues":         [f"Validation error: {str(exc)}"],
            "rows_before":    len(df_raw),
            "rows_after":     len(df_raw),
            "date_range":     {"from": None, "to": None},
            "months_covered": 0,
            "confidence":     "low",
        }

    return result
