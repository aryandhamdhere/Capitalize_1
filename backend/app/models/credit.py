from pydantic import BaseModel
from typing import Dict, Any, Optional


class CreditScoreRequest(BaseModel):
    filename: str


class ComponentScore(BaseModel):
    score: float
    max: int
    insight: str


class DataQuality(BaseModel):
    months_analyzed: int
    total_transactions: int
    confidence: str  # "high" | "medium" | "low"


class CreditScoreResponse(BaseModel):
    total_score: int
    components: Dict[str, ComponentScore]
    data_quality: DataQuality
    top_improvement: str
