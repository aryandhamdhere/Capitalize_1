from pydantic import BaseModel
from typing import Optional

class QueryRequest(BaseModel):
    query: str
    user: Optional[str] = None
    dry_run: Optional[bool] = False