# backend/app/routers/ingest.py
from fastapi import APIRouter, HTTPException
from pathlib import Path
import pandas as pd
from ..core.data_indexer import index_data

router = APIRouter(prefix="/api")
UPLOAD_DIR = Path("backend/app/storage/uploads/")

@router.post("/ingest/")
def ingest_file(filename: str):
    path = UPLOAD_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="file not found")
    try:
        if path.suffix.lower() == ".csv":
            df = pd.read_csv(path)
            index_data({"sheet1": df}, path.stem)
        elif path.suffix.lower() in [".xlsx", ".xls"]:
            xls = pd.read_excel(path, sheet_name=None)
            index_data(xls, path.stem)
        else:
            raise HTTPException(status_code=400, detail="unsupported file type")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"status": "indexed", "file": filename, "tables": list(index_data.__globals__['TABLE_REGISTRY'].keys())}
