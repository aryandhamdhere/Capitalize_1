"""
query_router.py — Routes a user query to the correct execution engine.

Returns: "duckdb" | "faiss" | "hybrid"

Decision logic:
  DUCKDB  → numerical/aggregation/time-series intent
  FAISS   → descriptive/search/name-lookup intent
  HYBRID  → named-entity + aggregation combined
  DEFAULT → duckdb (safest for financial queries)
"""

# ── Keyword sets ─────────────────────────────────────────────────────────────

# Strong signals for numerical/aggregation query → DuckDB
_DUCKDB_KEYWORDS = {
    # English aggregation
    "sum", "total", "average", "avg", "count", "how much", "how many",
    "compare", "trend", "monthly", "weekly", "quarterly", "yearly", "annual",
    "highest", "lowest", "maximum", "minimum", "max", "min",
    "growth", "percentage", "ratio", "margin", "profit", "loss",
    "revenue", "income", "expense", "expenses", "balance", "cashflow",
    "cash flow", "net", "inflow", "outflow", "forecast", "runway",
    "best month", "worst month", "last month", "this month", "last year",
    "quarter", "breakdown", "summary", "overview", "report",
    "eligible", "qualify", "loan amount", "credit score",
    "dso", "days sales", "working capital", "conversion cycle",
    # Hindi numerics
    "kitna", "kitne", "jyada", "zyada", "kam", "total", "sabse",
    "kamai", "kharch", "paisa", "mahine", "hafte", "saal",
    "ghata", "faida", "badha", "gira",
}

# Strong signals for descriptive/search query → FAISS
_FAISS_KEYWORDS = {
    "find", "search", "show transaction", "look for", "where",
    "which vendor", "which supplier", "which customer", "which buyer",
    "details of", "tell me about", "description", "narration",
    "transactions from", "payments from", "payments to",
    "entries for", "records for",
}

# Named-entity patterns that suggest hybrid
# If query contains a DUCKDB keyword AND a proper name → hybrid
_HYBRID_PHRASES = {
    "largest from", "biggest from", "total from", "total to",
    "payments from", "transactions from", "how much from", "how much to",
    "most payments to", "most from", "spending on",
}


def _contains_any(text: str, keywords: set) -> bool:
    for kw in keywords:
        if kw in text:
            return True
    return False


def _has_proper_noun(text: str) -> bool:
    """
    Heuristic: detect if query contains a specific vendor/customer name.
    Signals: word after "from", "to", "for" is capitalised; or query has
    a word > 3 chars that looks like a business name.
    """
    words = text.split()
    trigger_words = {"from", "to", "for", "by", "of"}
    for i, word in enumerate(words):
        if word.lower() in trigger_words and i + 1 < len(words):
            next_word = words[i + 1]
            if next_word[0].isupper() and len(next_word) > 2:
                return True
    return False


def route_query(query: str) -> str:
    """
    Route a natural language query to the correct execution engine.

    Returns:
        "duckdb"  — run SQL aggregation only
        "faiss"   — run semantic search only
        "hybrid"  — run both and merge results
    """
    q = query.lower().strip()

    # Check hybrid first (specific named-entity + aggregation patterns)
    if _contains_any(q, _HYBRID_PHRASES) and _has_proper_noun(query):
        return "hybrid"

    # Strong FAISS signals (search/descriptive intent)
    faiss_score = sum(1 for kw in _FAISS_KEYWORDS if kw in q)

    # Strong DuckDB signals (numerical/aggregation intent)
    duckdb_score = sum(1 for kw in _DUCKDB_KEYWORDS if kw in q)

    # If FAISS clearly wins with no aggregation intent → FAISS
    if faiss_score > 0 and duckdb_score == 0:
        return "faiss"

    # If both signal → hybrid
    if faiss_score > 0 and duckdb_score > 0:
        return "hybrid"

    # Default to DuckDB — covers all aggregation and unknown queries
    # DuckDB is more reliable than FAISS for financial data
    return "duckdb"
