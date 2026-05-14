from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    UPLOAD_DIR: str = "app/storage/uploads"
    PROCESSED_DIR: str = "app/storage/processed"
    REPORTS_DIR: str = "app/storage/reports"

    MODEL_DIR: str = "app/models/local_llm/"
    VECTOR_DB_PATH: str = "app/storage/index/faiss_index"

    SECRET_KEY: str = "supersecret"
    ALGORITHM: str = "HS256"

    # Google AI — used only from POST /api/dashboard/generate (cached per file)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.0-flash"

    class Config:
        env_file = ".env"


settings = Settings()
