"""
formatters.py — Indian number formatting and query result narration.
"""


def format_inr(amount: float) -> str:
    """
    Format a number in the Indian currency system.

    < 1,000        → ₹847
    1,000–99,999   → ₹45,230
    1L–99L         → ₹4.2L
    1Cr+           → ₹1.3Cr
    """
    if amount is None:
        return "N/A"
    try:
        amount = float(amount)
    except (TypeError, ValueError):
        return str(amount)

    abs_val = abs(amount)
    sign = "-" if amount < 0 else ""

    if abs_val >= 10_000_000:                          # 1 Crore+
        return f"{sign}₹{abs_val / 10_000_000:.1f}Cr"
    elif abs_val >= 100_000:                           # 1 Lakh+
        return f"{sign}₹{abs_val / 100_000:.1f}L"
    elif abs_val >= 1_000:                             # Thousands
        formatted = f"{abs_val:,.0f}"
        return f"{sign}₹{formatted}"
    else:
        return f"{sign}₹{abs_val:.0f}"


# Columns that hold currency values (used for auto-formatting)
_CURRENCY_COLS = {
    "revenue", "expense", "expenses", "inflow", "outflow", "net", "net_flow",
    "balance", "profit", "total", "total_inflow", "total_outflow", "total_paid",
    "avg_inflow", "avg_outflow", "avg_payment", "avg_amount", "avg_monthly_revenue",
    "working_capital", "net_position", "estimated_max_loan", "monthly_rev",
    "expected", "debit", "credit", "amount", "worst_month", "peak_balance",
    "lowest_balance", "annual_revenue", "annual_expenses", "annual_profit",
    "avg_revenue", "avg_daily_burn",
}

_DAY_COLS = {
    "avg_days_outstanding", "avg_receivable_days", "avg_payable_days",
    "days_remaining", "avg_days_to_collect", "days_since",
}

_COUNT_COLS = {
    "total_transactions", "transaction_count", "payment_count",
    "frequency", "inflow_count", "outflow_count", "months_of_data",
    "row_count",
}


def _format_cell(col: str, val) -> str:
    """Auto-format a single cell value based on column name."""
    if val is None or val == "" or str(val) == "nan":
        return "—"
    col_lower = col.lower()
    if col_lower in _CURRENCY_COLS:
        try:
            return format_inr(float(val))
        except (TypeError, ValueError):
            return str(val)
    if col_lower in _DAY_COLS:
        try:
            return f"{float(val):.0f} days"
        except (TypeError, ValueError):
            return str(val)
    if col_lower in _COUNT_COLS:
        try:
            return f"{int(float(val)):,}"
        except (TypeError, ValueError):
            return str(val)
    # Percentage columns
    if "pct" in col_lower or "percent" in col_lower or "growth" in col_lower:
        try:
            return f"{float(val):+.1f}%"
        except (TypeError, ValueError):
            return str(val)
    return str(val)


def format_rows(rows: list, columns: list) -> list:
    """
    Return rows with currency/day/count values auto-formatted as strings.
    Used for frontend display. Raw numeric rows are still available separately.
    """
    formatted = []
    for row in rows:
        formatted_row = {}
        for col in columns:
            raw = row.get(col)
            formatted_row[col] = _format_cell(col, raw)
        formatted.append(formatted_row)
    return formatted


def format_summary_sentence(rows: list, columns: list, insight_prefix: str = "") -> str:
    """
    Convert a single-row result into a readable sentence.
    For multi-row results returns a summary of the first row.
    """
    if not rows:
        return "No data available."
    row = rows[0]
    parts = []
    for col in columns:
        val = row.get(col)
        if val is not None:
            label = col.replace("_", " ").title()
            parts.append(f"{label}: {_format_cell(col, val)}")
    body = " · ".join(parts)
    return f"{insight_prefix} {body}".strip() if insight_prefix else body
