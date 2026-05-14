from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from ..core.output_formatter import export_to_excel
from ..config import settings

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/export")
async def export_report(payload: dict):
    try:
        df = payload["data"]
        filename = payload.get("filename", "report.xlsx")

        file_path = export_to_excel(df, filename)

        return FileResponse(
            file_path,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            filename=filename
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))