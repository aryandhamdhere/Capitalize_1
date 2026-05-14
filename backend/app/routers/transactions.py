from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from pathlib import Path
import duckdb
import pandas as pd
from ..core.credit_engine import load_and_normalise

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("/")
def get_transactions(
    filename: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    type: str = Query("all", pattern="^(all|credit|debit)$"),
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None,
    search: Optional[str] = None
):
    if not filename:
        raise HTTPException(status_code=400, detail="Filename is required")
        
    filepath = Path("uploads") / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="File not found")
        
    try:
        # Load and normalise returns df with: _date, _credit, _debit
        df = load_and_normalise(filepath)
        
        # Original data mapping
        # We need description. load_and_normalise currently drops description,
        # so let's load it again quickly to get descriptions if needed.
        # But wait, DuckDB can query the original file directly, or we can use Pandas.
        
        # Re-read raw to get description (a simplified fallback, usually load_and_normalise keeps what we need but we'll adapt)
        # Assuming the original load_and_normalise function returns just date, credit, debit.
        # Let's read raw for the description column if possible.
        try:
            raw_df = pd.read_csv(filepath) if filepath.suffix == '.csv' else pd.read_excel(filepath)
        except:
            raw_df = pd.DataFrame()
            
        desc_col = next((c for c in raw_df.columns if 'desc' in c.lower() or 'particular' in c.lower() or 'narration' in c.lower()), None)
        
        if desc_col:
            df["description"] = raw_df[desc_col].fillna("").astype(str)
        else:
            df["description"] = "Transaction"

        # Calculate balance
        df["balance"] = (df["_credit"].fillna(0) - df["_debit"].fillna(0)).cumsum()
        
        # Register with DuckDB
        conn = duckdb.connect(database=':memory:')
        conn.register('txns', df)
        
        # Build query
        where_clauses = []
        if type == "credit":
            where_clauses.append("_credit > 0")
        elif type == "debit":
            where_clauses.append("_debit > 0")
            
        if min_amount is not None:
            where_clauses.append(f"GREATEST(_credit, _debit) >= {min_amount}")
        if max_amount is not None:
            where_clauses.append(f"GREATEST(_credit, _debit) <= {max_amount}")
            
        if search:
            search_term = search.replace("'", "''").lower()
            where_clauses.append(f"LOWER(description) LIKE '%{search_term}%'")
            
        where_str = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""
        
        # Query total count
        total_query = f"SELECT COUNT(*) FROM txns {where_str}"
        total = conn.execute(total_query).fetchone()[0]
        
        # Query summary
        summary_query = f"""
            SELECT 
                SUM(CASE WHEN _credit > 0 THEN _credit ELSE 0 END) as total_credits,
                SUM(CASE WHEN _debit > 0 THEN _debit ELSE 0 END) as total_debits
            FROM txns {where_str}
        """
        summary_res = conn.execute(summary_query).fetchone()
        t_credits = float(summary_res[0] or 0)
        t_debits = float(summary_res[1] or 0)
        
        # Pagination
        offset = (page - 1) * limit
        data_query = f"""
            SELECT 
                strftime(_date, '%Y-%m-%d') as date,
                description,
                _credit as credit,
                _debit as debit,
                balance
            FROM txns 
            {where_str}
            ORDER BY _date DESC
            LIMIT {limit} OFFSET {offset}
        """
        results = conn.execute(data_query).fetchdf()
        
        # Convert to dicts
        transactions = []
        for _, row in results.iterrows():
            is_credit = row['credit'] > 0
            transactions.append({
                "date": row['date'],
                "description": row['description'],
                "credit": float(row['credit'] or 0),
                "debit": float(row['debit'] or 0),
                "balance": float(row['balance'] or 0),
                "type": "credit" if is_credit else "debit"
            })
            
        return {
            "transactions": transactions,
            "total": total,
            "page": page,
            "pages": (total + limit - 1) // limit,
            "summary": {
                "total_credits": t_credits,
                "total_debits": t_debits,
                "net": t_credits - t_debits
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
