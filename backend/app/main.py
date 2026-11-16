import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.database.session import SessionLocal
from app.database.init_db import init_db
from app.ml.model_loader import model_loader
from app.api.routes import health, chatbot, gamification, users, quiz, auth

# Konfigurasi logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("academic_assistant")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Siklus hidup aplikasi: Inisialisasi Database dan Loading Artefak ML saat startup."""
    logger.info("Initializing Academic Assistant ITS Backend...")

    # 1. Inisialisasi Database dan Data Gamifikasi Awal
    try:
        db = SessionLocal()
        init_db(db)
        db.close()
        logger.info("Database initialized and default gamification seeded successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}", exc_info=True)

    # 2. Load Artefak Preprocessing & Model Langkah 2
    try:
        model_loader.load_artifacts()
        logger.info("ML Models and FAQ dataset loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load ML artifacts: {e}", exc_info=True)

    yield

    logger.info("Shutting down Academic Assistant ITS Backend.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Backend REST API untuk Chatbot Layanan Informasi dan FAQ Akademik Adaptif "
        "dengan Sistem Gamifikasi Terintegrasi. Menggunakan integrasi algoritma "
        "TF-IDF + Cosine Similarity dan Fuzzy Matching (RapidFuzz)."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware (mendukung frontend React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Validation Error Handler untuk memastikan format error ramah frontend
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    safe_details = []
    for err in exc.errors():
        field_loc = " -> ".join([str(loc) for loc in err.get("loc", [])])
        msg = err.get("msg", "Input tidak valid")
        errors.append(f"{field_loc}: {msg}")

        # Stringify any exception instances in ctx to prevent JSON serialization errors
        detail_copy = dict(err)
        if "ctx" in detail_copy and isinstance(detail_copy["ctx"], dict):
            detail_copy["ctx"] = {k: str(v) for k, v in detail_copy["ctx"].items()}
        safe_details.append(detail_copy)

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "status": "validation_error",
            "message": "Validasi masukan gagal.",
            "errors": errors,
            "details": safe_details
        }
    )

# Include Routers
app.include_router(health.router)
app.include_router(chatbot.router)
app.include_router(gamification.router)
app.include_router(users.router)
app.include_router(quiz.router)
app.include_router(auth.router)

@app.get("/", summary="Root Welcome Endpoint")
def read_root():
    return {
        "message": "Selamat datang di Academic Assistant ITS API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
