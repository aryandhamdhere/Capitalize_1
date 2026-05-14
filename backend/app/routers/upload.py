from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import pandas as pd
import shutil

# Core pipeline
from ..core.data_indexer import index_data
from ..core.data_validator import validate_and_normalise

router = APIRouter(prefix="/upload")

UPLOAD_DIR = Path("backend/app/storage/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/")
async def upload_file(file: UploadFile = File(...)):
    # ── Step 1: Save raw file ────────────────────────────────────────────────
    save_path = UPLOAD_DIR / file.filename
    with save_path.open("wb") as f:
        shutil.copyfileobj(file.file, f)

    # ── Step 2: Load into DataFrame ──────────────────────────────────────────
    try:
        suffix = save_path.suffix.lower()
        if suffix == ".csv":
            # Try common encodings gracefully
            df_raw = None
            for enc in ["utf-8", "latin-1", "cp1252"]:
                try:
                    df_raw = pd.read_csv(save_path, encoding=enc, skip_blank_lines=True)
                    break
                except UnicodeDecodeError:
                    continue
            if df_raw is None:
                raise ValueError("Could not decode CSV with any known encoding.")

        elif suffix in [".xlsx", ".xls"]:
            df_raw = pd.read_excel(save_path)

        else:
            # Unsupported type — save only, no indexing
            return {
                "status":       "saved",
                "file":         file.filename,
                "indexed":      False,
                "file_type":    "unsupported",
                "bank_detected": None,
                "quality":      None,
                "detail":       "File saved but not indexed — only CSV/Excel are supported.",
            }

        df_raw.columns = [str(c).strip() for c in df_raw.columns]
        df_raw.dropna(how="all", inplace=True)

    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read file: {str(e)}")

    # ── Step 3: Validate + Normalise (safe — never blocks upload) ────────────
    validation = validate_and_normalise(
        df_raw=df_raw,
        upload_dir=UPLOAD_DIR,
        stem=save_path.stem,
    )

    df_to_index   = validation["df_to_index"]
    file_type     = validation["file_type"]
    bank_detected = validation["bank_detected"]
    quality       = validation["quality"]

    # ── Step 4: Index normalised (or raw) data ───────────────────────────────
    try:
        # Use stem of normalised file if one was saved, else original stem
        index_name = (
            validation["normalised_path"].stem
            if validation["normalised_path"]
            else save_path.stem
        )

        if suffix in [".xlsx", ".xls"] and file_type != "bank_statement":
            # Excel multi-sheet — index each sheet separately as before
            sheets = pd.read_excel(save_path, sheet_name=None)
            index_data(sheets, file_name=save_path.stem)
        else:
            index_data({"sheet1": df_to_index}, file_name=index_name)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

    # ── Step 5: Return enriched response ─────────────────────────────────────
    return {
        # Original fields — backward compatible
        "status":  "success",
        "file":    file.filename,
        "indexed": True,
        # New enrichment fields
        "file_type":    file_type,
        "bank_detected": bank_detected,
        "quality": {
            "score":          quality.get("quality_score", 0),
            "issues":         quality.get("issues", []),
            "rows_before":    quality.get("rows_before", 0),
            "rows_after":     quality.get("rows_after", 0),
            "months_covered": quality.get("months_covered", 0),
            "date_range":     quality.get("date_range", {}),
            "confidence":     quality.get("confidence", "low"),
        },
    }
