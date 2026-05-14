"""
On-demand AI dashboard: one Gemini call per CSV file (cached until file changes).
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..config import settings
from ..core.dashboard_bundle import build_dashboard_bundle, facts_json_for_gemini, merge_ai_narrative
from ..core.gemini_client import generate_dashboard_narrative

router = APIRouter(prefix="/dashboard", tags=["Dashboard AI"])

UPLOAD_DIR = Path("backend/app/storage/uploads")
CACHE_DIR = Path("backend/app/storage/dashboard_cache")


class GenerateRequest(BaseModel):
    filename: str


def _file_fingerprint(path: Path) -> str:
    st = path.stat()
    raw = f"{path.name}\0{st.st_size}\0{int(st.st_mtime_ns)}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


def _cache_path(fp: str) -> Path:
    return CACHE_DIR / f"{fp}.json"


@router.post("/generate")
def generate_dashboard(req: GenerateRequest):
    filename = Path(req.filename).name
    filepath = UPLOAD_DIR / filename

    if not filepath.exists():
        raise HTTPException(
            status_code=404,
            detail=f"File '{filename}' not found. Upload it first.",
        )
    if filepath.suffix.lower() not in [".csv", ".xlsx", ".xls"]:
        raise HTTPException(status_code=422, detail="Only CSV or Excel files are supported.")

    fingerprint = _file_fingerprint(filepath)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = _cache_path(fingerprint)

    if cache_file.exists():
        try:
            cached = json.loads(cache_file.read_text(encoding="utf-8"))
            cached["ai"]["from_cache"] = True
            return cached
        except (json.JSONDecodeError, OSError):
            pass

    try:
        bundle = build_dashboard_bundle(filepath)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard build failed: {e}")

    facts = facts_json_for_gemini(bundle)
    try:
        ai = generate_dashboard_narrative(facts)
    except Exception as e:
        if settings.GEMINI_API_KEY:
            raise HTTPException(
                status_code=502,
                detail=f"Gemini request failed: {e}. Check GEMINI_API_KEY and model name.",
            )
        ai = {"executive_summary": None, "recommendations": [], "gemini_skipped": True}

    out = merge_ai_narrative(bundle, ai)
    out["file_fingerprint"] = fingerprint

    try:
        cache_file.write_text(json.dumps(out, default=str), encoding="utf-8")
    except OSError:
        pass

    return out
