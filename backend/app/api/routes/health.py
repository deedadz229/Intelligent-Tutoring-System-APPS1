from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Any, Dict

from app.core.config import settings
from app.database.session import get_db
from app.ml.model_loader import model_loader

router = APIRouter(tags=["Health"])

@router.get("/health", summary="Health Check Status")
def health_check(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Mengembalikan status komprehensif sistem Academic Assistant:
    - Status aplikasi
    - Status model TF-IDF
    - Status dataset FAQ
    - Status database SQLite
    """
    # 1. Database status
    db_healthy = False
    try:
        db.execute(text("SELECT 1"))
        db_healthy = True
    except Exception:
        db_healthy = False

    # 2. Model & Dataset status
    stats = model_loader.get_stats()
    model_loaded = stats.get("loaded", False)

    is_overall_healthy = db_healthy and model_loaded

    return {
        "status": "healthy" if is_overall_healthy else "degraded",
        "app": {
            "name": settings.PROJECT_NAME,
            "environment": settings.ENVIRONMENT,
            "version": "1.0.0"
        },
        "model": {
            "loaded": model_loaded,
            "matrix_shape": stats.get("matrix_shape", []),
            "vocab_size": stats.get("vocab_size", 0),
            "fuzzy_corpus_size": stats.get("fuzzy_corpus_size", 0),
            "cosine_threshold": settings.COSINE_THRESHOLD,
            "fuzzy_threshold": settings.FUZZY_THRESHOLD
        },
        "dataset": {
            "loaded": model_loaded,
            "total_faq": stats.get("dataset_rows", 0),
            "verification_rows": stats.get("verification_rows", 0),
            "columns": stats.get("dataset_columns", [])
        },
        "database": {
            "connected": db_healthy,
            "engine": "sqlite"
        }
    }
