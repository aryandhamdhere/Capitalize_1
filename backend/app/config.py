from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    UPLOAD_DIR: str = "app/storage/uploads"
    PROCESSED_DIR: str = "app/storage/processed"
    REPORTS_DIR: str = "app/storage/reports"

    MODEL_DIR: str = "app/models/local_llm/"
    VECTOR_DB_PATH: str = "app/storage/index/faiss_index"

    SECRET_KEY: str = "supersecret"
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"


settings = Settings()
