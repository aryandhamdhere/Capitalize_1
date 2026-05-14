from fastapi import APIRouter, HTTPException
from ..models.auth import LoginRequest
from ..utils.security import create_token

router = APIRouter(prefix="/auth", tags=["Auth"])

fake_user = {
    "username": "admin",
    "password": "admin123"
}

@router.post("/login")
def login(req: LoginRequest):
    if req.username == fake_user["username"] and req.password == fake_user["password"]:
        token = create_token({"sub": req.username})
        return {"access_token": token}

    raise HTTPException(status_code=401, detail="Invalid credentials")
