from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import upload, query, reports, health, auth
from .routers.ingest import router as ingest_router
from .routers.credit import router as credit_router
from .routers.transactions import router as transactions_router

app = FastAPI(title="Capitalize API", version="1.0")

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(upload.router,  prefix="/api")
app.include_router(query.router,   prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(health.router,  prefix="/api")
app.include_router(auth.router,    prefix="/api")
app.include_router(ingest_router)
app.include_router(credit_router,  prefix="/api")
app.include_router(transactions_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "Capitalize API running", "version": "1.0"}
