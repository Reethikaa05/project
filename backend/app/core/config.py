import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DataBoard API"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "databoard-super-secret-jwt-key-2025-xvector")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60  # 1 hour
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7    # 7 days
    
    # PostgreSQL primary, fallback to SQLite if PostgreSQL URL is not provided or inaccessible
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./databoard.db"
    )

    class Config:
        case_sensitive = True

settings = Settings()
