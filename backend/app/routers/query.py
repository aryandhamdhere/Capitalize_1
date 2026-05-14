from fastapi import APIRouter, HTTPException
from ..models.query import QueryRequest
from ..core.agent import analytics_agent

router = APIRouter(prefix="/query", tags=["Query"])

@router.post("/")
async def run_query(request: QueryRequest):
    try:
        response = analytics_agent.run(request.query)
        return {"result": response["output"], "metadata": response["metadata"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
