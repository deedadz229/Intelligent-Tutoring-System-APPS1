import time
from typing import Optional
from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.chatbot import ProcessRequest, ProcessResponse
from app.services.cosine_service import cosine_service
from app.services.fuzzy_service import fuzzy_service
from app.services.gamification_service import gamification_service
from app.models.chat import ChatHistory
from app.models.user import User

class ChatbotService:
    def process_query(
        self,
        request: ProcessRequest,
        db: Optional[Session] = None
    ) -> ProcessResponse:
        """
        Alur Utama Chatbot NLP Engine (Langkah 3 Notebook):
        1. Cosine Similarity (TF-IDF Vectorizer + Matriks FAQ, threshold 0.35).
        2. Jika skor < 0.35, lanjutkan ke Fuzzy Matching (RapidFuzz fuzz.ratio, threshold 75).
        3. Jika tidak cocok di kedua metode, kembalikan status 'no_answer'.
        """
        start_time = time.time()
        question = request.question.strip()
        user_id = request.user_id or 1

        # Tahap A: TF-IDF + Cosine Similarity
        cosine_res = cosine_service.match(question, threshold=settings.COSINE_THRESHOLD)

        if cosine_res["matched"]:
            match_method = "cosine_similarity"
            status = "answer_found"
            answer = cosine_res["answer"]
            category = cosine_res["category"]
            score = cosine_res["score"]
            matched_question = cosine_res["question"]
            total_time_ms = round((time.time() - start_time) * 1000, 2)
        else:
            # Tahap B: Fallback ke Fuzzy Matching
            fuzzy_res = fuzzy_service.match(question, threshold=settings.FUZZY_THRESHOLD)

            if fuzzy_res["matched"]:
                match_method = "fuzzy_matching"
                status = "answer_found"
                answer = fuzzy_res["answer"]
                category = fuzzy_res["category"]
                score = fuzzy_res["score"]
                matched_question = fuzzy_res["question"]
                total_time_ms = round((time.time() - start_time) * 1000, 2)
            else:
                # Tidak ditemukan di kedua metode
                match_method = None
                status = "no_answer"
                answer = None
                category = None
                score = cosine_res.get("score", 0.0)
                matched_question = None
                total_time_ms = round((time.time() - start_time) * 1000, 2)

        # Tentukan tingkat akurasi sesuai format Langkah 4 (cell 78 notebook)
        if status == "answer_found":
            if match_method == "cosine_similarity":
                accuracy_level = "Tinggi" if (score is not None and score >= 0.70) else "Sedang"
            else:
                accuracy_level = "Tinggi" if (score is not None and score >= 85.0) else "Sedang"
        else:
            accuracy_level = "Rendah"

        xp_earned = 0
        level_up = False
        new_total_xp = None
        current_level = None

        # Simpan ke ChatHistory & catat integrasi gamifikasi secara transaksional
        if db is not None and user_id is not None:
            try:
                # Verifikasi bahwa pengguna benar-benar terdaftar di database (tidak membuat akun otomatis)
                user = db.query(User).filter(User.id == user_id).first()
                if user:
                    chat_entry = ChatHistory(
                        user_id=user.id,
                        question=question,
                        answer=answer,
                        category=category,
                        match_method=match_method,
                        score=score,
                        matched_question=matched_question,
                        execution_time_ms=total_time_ms
                    )
                    db.add(chat_entry)
                    db.commit()

                    # 1. Berikan reward XP terukur berdasarkan algoritma (Langkah 4 & 5)
                    xp_earned, level_up, new_total_xp, current_level = gamification_service.award_chat_xp(
                        db=db,
                        user_id=user.id,
                        status=status,
                        match_method=match_method,
                        score=score
                    )

                    # 2. Update quest aktivitas belajar & evaluasi pencapaian terkait algoritma
                    gamification_service.record_chat_activity(
                        db=db,
                        user_id=user.id,
                        question=question,
                        match_method=match_method,
                        score=score,
                        status=status
                    )
            except Exception as e:
                # Log error db tanpa memutus respons utama NLP
                db.rollback()

        return ProcessResponse(
            success=True,
            status=status,
            question=question,
            answer=answer,
            category=category,
            match_method=match_method,
            score=score,
            matched_question=matched_question,
            execution_time_ms=total_time_ms,
            accuracy_level=accuracy_level,
            xp_earned=xp_earned,
            level_up=level_up,
            new_total_xp=new_total_xp,
            current_level=current_level
        )

chatbot_service = ChatbotService()
