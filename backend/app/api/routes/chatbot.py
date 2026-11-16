from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional
from datetime import date

from app.database.session import get_db
from app.schemas.chatbot import ProcessRequest, ProcessResponse, FeedbackRequest
from app.services.chatbot_service import chatbot_service
from app.services.faq_service import faq_service
from app.models.chat import UserFeedback, ChatHistory
from app.models.gamification import QuestProgress
from app.models.user import User
from app.api.deps import get_optional_user, get_current_user

router = APIRouter(prefix="/api", tags=["Chatbot"])

@router.post(
    "/process",
    response_model=ProcessResponse,
    status_code=status.HTTP_200_OK,
    summary="Proses Pertanyaan Akademik Pengguna"
)
def process_question(
    request: ProcessRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
) -> ProcessResponse:
    """
    Endpoint utama Chatbot FAQ Akademik.
    Mengaitkan pertanyaan secara aman dengan akun pengguna yang sedang login.
    """
    try:
        if current_user:
            request.user_id = current_user.id
        elif request.user_id:
            # Pastikan user_id valid dan terdaftar
            valid_user = db.query(User).filter(User.id == request.user_id).first()
            if not valid_user:
                request.user_id = None

        response = chatbot_service.process_query(request, db=db)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Terjadi kesalahan saat memproses pertanyaan: {str(e)}"
        )


@router.post(
    "/feedback",
    status_code=status.HTTP_201_CREATED,
    summary="Kirim Feedback Jawaban Chatbot"
)
def submit_feedback(
    request: FeedbackRequest,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Mengirim rating dan komentar untuk jawaban chatbot, terhubung ke akun pengguna yang memberikan masukan."""
    try:
        user_id = current_user.id if current_user else request.user_id
        feedback = UserFeedback(
            chat_id=request.chat_id,
            user_id=user_id,
            rating=request.rating,
            comment=request.comment
        )
        db.add(feedback)

        # Update quest_feedback progress jika ada user_id valid
        if user_id:
            today = date.today()
            p = db.query(QuestProgress).filter(
                QuestProgress.user_id == user_id,
                QuestProgress.quest_id == "quest_feedback",
                QuestProgress.quest_date == today
            ).first()
            if p and not p.is_completed:
                p.current_count += 1

        db.commit()

        return {
            "success": True,
            "message": "Feedback berhasil dikirim. Terima kasih atas masukan Anda!"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menyimpan feedback: {str(e)}"
        )


@router.get(
    "/chat/history",
    summary="Riwayat Percakapan Pengguna Login"
)
def get_user_chat_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mengambil riwayat percakapan khusus untuk pengguna yang sedang login.
    Menjamin isolasi data dan privasi agar histori antar-mahasiswa tidak tercampur.
    """
    chats = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id
    ).order_by(ChatHistory.created_at.desc()).limit(limit).all()

    return [
        {
            "id": c.id,
            "question": c.question,
            "answer": c.answer,
            "category": c.category,
            "match_method": c.match_method,
            "score": c.score,
            "matched_question": c.matched_question,
            "execution_time_ms": c.execution_time_ms,
            "created_at": c.created_at
        }
        for c in chats
    ]


@router.get(
    "/faq/categories",
    summary="Daftar Kategori FAQ"
)
def get_categories() -> List[Dict[str, Any]]:
    """Mendapatkan daftar seluruh kategori FAQ dan jumlah pertanyaan per kategori."""
    return faq_service.get_categories()


@router.get(
    "/faq/samples",
    summary="Contoh Pertanyaan FAQ"
)
def get_samples(limit: int = 5) -> List[str]:
    """Mendapatkan contoh pertanyaan acak dari dataset untuk inspirasi pengguna."""
    return faq_service.get_sample_questions(limit=limit)


@router.get(
    "/faq/verification",
    summary="Daftar Data Perlu Verifikasi (Langkah 2)"
)
def get_verification_data(limit: int = 20) -> List[Dict[str, Any]]:
    """Melihat data yang ditandai untuk pemeriksaan manual dari qa_perlu_verifikasi.csv."""
    return faq_service.get_verification_items(limit=limit)
