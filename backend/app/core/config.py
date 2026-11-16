import os
from pathlib import Path
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

# Backend root directory: D:\Tubes ITS\backend
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_DIR = BACKEND_DIR.parent

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    PROJECT_NAME: str = "Academic Assistant ITS"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"

    # Database
    DATABASE_URL: str = f"sqlite:///{BACKEND_DIR / 'academic_assistant.db'}"

    # Authentication & Security
    SECRET_KEY: str = "its-academic-assistant-secret-key-2026-secure-jwt"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 hari

    # NLP & Machine Learning Artifacts
    DATASET_PATH: str = "dataset/dataset_faq_preprocessed.csv"
    VERIFICATION_DATASET_PATH: str = "dataset/qa_perlu_verifikasi.csv"
    TFIDF_VECTORIZER_PATH: str = "model/tfidf_vectorizer.joblib"
    TFIDF_MATRIX_PATH: str = "model/tfidf_matrix.npz"

    # NLP Thresholds (Original thresholds from Google Colab Notebook Tubes_ITS_Kel_1.ipynb)
    COSINE_THRESHOLD: float = 0.35
    FUZZY_THRESHOLD: float = 75.0

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def assemble_database_url(cls, v: str) -> str:
        # Standardize relative SQLite database URLs to always point canonically to BACKEND_DIR / academic_assistant.db
        if v.startswith("sqlite:///./") or v == "sqlite:///academic_assistant.db":
            return f"sqlite:///{BACKEND_DIR / 'academic_assistant.db'}"
        return v

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    def resolve_path(self, relative_or_absolute_path: str) -> Path:
        """Resolve a file path relative to backend directory or project directory."""
        p = Path(relative_or_absolute_path)
        if p.is_absolute() and p.exists():
            return p
        # Try relative to BACKEND_DIR
        candidate1 = BACKEND_DIR / p
        if candidate1.exists():
            return candidate1
        # Try relative to PROJECT_DIR
        candidate2 = PROJECT_DIR / p
        if candidate2.exists():
            return candidate2
        # Try relative to current working directory
        candidate3 = Path.cwd() / p
        if candidate3.exists():
            return candidate3
        # Fall back to BACKEND_DIR / p
        return candidate1

settings = Settings()
