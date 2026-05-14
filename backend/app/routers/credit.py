from fastapi import APIRouter, HTTPException
from pathlib import Path

from ..models.credit import CreditScoreRequest
from ..core.credit_engine import compute_credit_score

router = APIRouter(prefix="/credit", tags=["Credit Score"])

UPLOAD_DIR = Path("backend/app/storage/uploads")


@router.post("/score")
def get_credit_score(request: CreditScoreRequest):
    """
    Compute a real credit score from a previously uploaded file.

    Expects: { "filename": "sample_finance_data.csv" }
    Returns: full credit score breakdown (total, 4 components, quality, tip)
    """
    # Sanitise filename — no path traversal
    filename = Path(request.filename).name
    filepath = UPLOAD_DIR / filename

    if not filepath.exists():
        raise HTTPException(
            status_code=404,
            detail=f"File '{filename}' not found. Please upload it first via /api/upload/",
        )

    if filepath.suffix.lower() not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(
            status_code=422,
            detail="Only CSV and Excel files are supported for credit scoring.",
        )

    try:
        result = compute_credit_score(filepath)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Credit scoring failed: {str(e)}",
        )
