from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database.session import get_db
from app.schemas.quiz import QuizQuestion, QuizSubmitRequest, QuizSubmitResponse
from app.services.quiz_service import quiz_service
from app.models.user import User
from app.api.deps import get_optional_user

router = APIRouter(prefix="/api/quiz", tags=["Quiz"])

@router.get(
    "/questions",
    response_model=List[QuizQuestion],
    summary="Daftar Soal Kuis Akademik"
)
def get_quiz_questions(
    count: int = Query(default=5, ge=1, le=10, description="Jumlah soal yang diminta")
) -> List[QuizQuestion]:
    """Mendapatkan soal kuis pemahaman regulasi akademik ITS dari dataset kurikulum terverifikasi."""
    return quiz_service.get_questions(count=count)


@router.post(
    "/submit",
    response_model=QuizSubmitResponse,
    status_code=status.HTTP_200_OK,
    summary="Kirim Jawaban Kuis & Peroleh Reward XP"
)
def submit_quiz_answers(
    request: QuizSubmitRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
) -> QuizSubmitResponse:
    """
    Memvalidasi jawaban pengguna, menghitung skor, mencatat progres gamifikasi,
    dan memberikan reward XP terukur secara transaksional di backend.
    """
    try:
        if current_user:
            request.user_id = current_user.id
        elif request.user_id:
            # Pastikan user_id valid
            valid_user = db.query(User).filter(User.id == request.user_id).first()
            if not valid_user:
                request.user_id = 1
        return quiz_service.submit_quiz(db=db, request=request)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan saat memproses jawaban kuis: {str(e)}"
        )
