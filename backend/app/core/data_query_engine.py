"""
data_query_engine.py — Clean separation of DuckDB and FAISS query paths.

PUBLIC API (unchanged for agent.py):
  run_data_query(query_text, sql_instruction) → DataFrame | list[DataFrame]

NEW INTERNAL API:
  query_duckdb(table_key, sql) → dict
  query_faiss(query_text)      → dict
  query_hybrid(query_text, table_key, sql) → dict
"""

import duckdb
import numpy as np
import pandas as pd
from typing import Optional

from .data_indexer import encoder, index, METADATA, TABLE_REGISTRY
from ..utils.formatters import format_rows, format_inr


# ─────────────────────────────────────────────────────────────────────────────
# Internal helpers
# ─────────────────────────────────────────────────────────────────────────────

def _best_table() -> Optional[str]:
    """Return the most recently indexed table key, or None."""
    if not TABLE_REGISTRY:
        return None
    return list(TABLE_REGISTRY.keys())[-1]


def _semantic_table_search(query: str, top_k: int = 3) -> list[str]:
    """
    Use FAISS to find which table(s) are most relevant to the query.
    Returns deduplicated list of table keys.
    """
    if index.ntotal == 0:
        return []
    q_emb = encoder.encode([query])[0].astype("float32")
    D, I = index.search(np.array([q_emb]), min(top_k, index.ntotal))
    seen, result = set(), []
    for i in I[0]:
        if i < len(METADATA):
            key = METADATA[i]["table"]
            if key not in seen:
                seen.add(key)
                result.append(key)
    return result


# ─────────────────────────────────────────────────────────────────────────────
# query_duckdb — SQL aggregation on a registered DataFrame
# ─────────────────────────────────────────────────────────────────────────────

def query_duckdb(table_key: str, sql: str) -> dict:
    """
    Execute SQL directly on a registered DataFrame via DuckDB.

    Returns:
        {
            "rows": list[dict],       # raw numeric values
            "rows_formatted": list,   # INR/day formatted
            "columns": list[str],
            "row_count": int,
            "engine": "duckdb",
            "error": None | str,
        }
    """
    if table_key not in TABLE_REGISTRY:
        return {
            "rows": [], "rows_formatted": [], "columns": [],
            "row_count": 0, "engine": "duckdb",
            "error": f"Table '{table_key}' not found. Please re-upload your file.",
        }

    df = TABLE_REGISTRY[table_key]

    try:
        con = duckdb.connect()
        con.register("t", df)
        result_df = con.execute(sql).df()
        con.close()

        rows = result_df.to_dict(orient="records")
        cols = list(result_df.columns)

        return {
            "rows":           rows,
            "rows_formatted": format_rows(rows, cols),
            "columns":        cols,
            "row_count":      len(rows),
            "engine":         "duckdb",
            "error":          None,
        }

    except Exception as e:
        return {
            "rows": [], "rows_formatted": [], "columns": [],
            "row_count": 0, "engine": "duckdb",
            "error": f"Query failed: {str(e)}",
        }


# ─────────────────────────────────────────────────────────────────────────────
# query_faiss — Semantic search over transaction descriptions
# ─────────────────────────────────────────────────────────────────────────────

def query_faiss(query_text: str, top_k: int = 5) -> dict:
    """
    Semantic similarity search across indexed table text.
    Returns the most relevant table entries with similarity scores.

    Returns:
        {
            "rows": list[dict],
            "columns": list[str],
            "row_count": int,
            "engine": "faiss",
            "error": None | str,
        }
    """
    if index.ntotal == 0:
        return {
            "rows": [], "columns": [], "row_count": 0,
            "engine": "faiss",
            "error": "No data indexed yet. Please upload a file first.",
        }

    try:
        q_emb = encoder.encode([query_text])[0].astype("float32")
        k = min(top_k, index.ntotal)
        D, I = index.search(np.array([q_emb]), k)

        rows = []
        for dist, idx in zip(D[0], I[0]):
            if idx < len(METADATA):
                entry = METADATA[idx]
                table_key = entry["table"]
                similarity = float(1 / (1 + dist))   # convert L2 dist → similarity score
                rows.append({
                    "table":      table_key,
                    "similarity": round(similarity, 3),
                    "preview":    entry["text"][:200].replace("\n", " "),
                })

        cols = ["table", "similarity", "preview"]
        return {
            "rows":      rows,
            "columns":   cols,
            "row_count": len(rows),
            "engine":    "faiss",
            "error":     None,
        }

    except Exception as e:
        return {
            "rows": [], "columns": [], "row_count": 0,
            "engine": "faiss",
            "error": f"FAISS search failed: {str(e)}",
        }


# ─────────────────────────────────────────────────────────────────────────────
# query_hybrid — DuckDB aggregation + FAISS search merged
# ─────────────────────────────────────────────────────────────────────────────

def query_hybrid(query_text: str, table_key: str, sql: str) -> dict:
    """
    Run DuckDB aggregation AND FAISS semantic search.
    Returns merged result with both numerical answer and relevant transactions.

    Returns:
        {
            "duckdb": dict,    # numerical result
            "faiss":  dict,    # semantic matches
            "engine": "hybrid",
            "row_count": int,  # total rows from duckdb (primary)
        }
    """
    db_result   = query_duckdb(table_key, sql)
    faiss_result = query_faiss(query_text)

    return {
        "duckdb":    db_result,
        "faiss":     faiss_result,
        "engine":    "hybrid",
        "row_count": db_result["row_count"],
        # Expose top-level rows/columns from DuckDB (primary result)
        "rows":      db_result["rows"],
        "columns":   db_result["columns"],
    }


# ─────────────────────────────────────────────────────────────────────────────
# run_data_query — Public API (unchanged interface for agent.py)
# ─────────────────────────────────────────────────────────────────────────────

def run_data_query(query_text: str, sql_instruction: str, engine: str = "duckdb"):
    """
    Main query entry point called by agent.py.

    Args:
        query_text:      Original NL query (used for FAISS and table selection)
        sql_instruction: SQL to execute (used for DuckDB)
        engine:          "duckdb" | "faiss" | "hybrid" (from query_router)

    Returns:
        DataFrame or list[DataFrame] — preserving original contract with agent.py
    """
    # Find best table via FAISS index (table-level, not row-level)
    tables = _semantic_table_search(query_text)

    # Fallback: use most recently indexed table
    if not tables:
        latest = _best_table()
        if latest:
            tables = [latest]
        else:
            raise ValueError("No data indexed. Please upload a file first.")

    table_key = tables[0]

    if engine == "faiss":
        result = query_faiss(query_text)
        if result["error"]:
            raise ValueError(result["error"])
        return pd.DataFrame(result["rows"], columns=result["columns"]) if result["rows"] else pd.DataFrame()

    if engine == "hybrid":
        result = query_hybrid(query_text, table_key, sql_instruction)
        # Return DuckDB rows as primary result for agent.py compatibility
        rows = result["duckdb"]["rows"]
        cols = result["duckdb"]["columns"]
        return pd.DataFrame(rows, columns=cols) if rows else pd.DataFrame()

    # Default: duckdb
    result = query_duckdb(table_key, sql_instruction)
    if result["error"]:
        raise ValueError(result["error"])
    rows = result["rows"]
    cols = result["columns"]
    return pd.DataFrame(rows, columns=cols) if rows else pd.DataFrame()
