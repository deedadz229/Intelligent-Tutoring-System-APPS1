import random
from datetime import date, datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from app.schemas.quiz import (
    QuizOption,
    QuizQuestion,
    QuizSubmitRequest,
    QuizQuestionReview,
    QuizSubmitResponse
)
from app.models.gamification import QuestProgress, UserAchievement, Achievement, XPTransaction
from app.services.gamification_service import gamification_service

# Bank Soal Akademik Aktual dari Buku Pedoman Regulasi Akademik
ACADEMIC_QUIZ_BANK = [
    {
        "id": "q1",
        "question": "Berapakah batas maksimal pengambilan SKS pada semester reguler bagi mahasiswa yang memperoleh IPS (Indeks Prestasi Semester) >= 3.00?",
        "category": "Kurikulum & KRS",
        "options": [
            {"id": "A", "text": "18 SKS"},
            {"id": "B", "text": "20 SKS"},
            {"id": "C", "text": "24 SKS"},
            {"id": "D", "text": "28 SKS"}
        ],
        "correct_id": "C",
        "explanation": "Berdasarkan pedoman akademik, mahasiswa dengan IPS minimal 3.00 berhak mengambil beban studi maksimal hingga 24 SKS pada semester berikutnya."
    },
    {
        "id": "q2",
        "question": "Berapa lama batas maksimal cuti akademik yang diizinkan untuk mahasiswa program sarjana (S1) selama masa studi?",
        "category": "Status Studi & Cuti",
        "options": [
            {"id": "A", "text": "Maksimal 1 semester berturut-turut"},
            {"id": "B", "text": "Maksimal 2 semester (baik berturut-turut maupun terpisah)"},
            {"id": "C", "text": "Maksimal 4 semester tanpa batas"},
            {"id": "D", "text": "Tidak dibatasi selama membayar UKT"}
        ],
        "correct_id": "B",
        "explanation": "Cuti akademik untuk program sarjana diberikan maksimal 2 semester selama masa studi dan waktu cuti tersebut tidak diperhitungkan dalam batas masa studi maksimal."
    },
    {
        "id": "q3",
        "question": "Apa syarat minimal kehadiran kuliah mahasiswa agar berhak mengikuti Ujian Akhir Semester (UAS)?",
        "category": "Evaluasi & Perkuliahan",
        "options": [
            {"id": "A", "text": "Minimal 50% dari total tatap muka"},
            {"id": "B", "text": "Minimal 75% dari total tatap muka perkuliahan"},
            {"id": "C", "text": "Minimal 85% dari total tatap muka perkuliahan"},
            {"id": "D", "text": "Minimal 90% dengan surat keterangan dokter"}
        ],
        "correct_id": "B",
        "explanation": "Syarat presensi perkuliahan untuk dapat mengikuti UAS adalah minimal 75% dari total tatap muka terjadwal."
    },
    {
        "id": "q4",
        "question": "Berapa jumlah total SKS minimal yang wajib diselesaikan untuk dinyatakan lulus dari Program Sarjana (S1)?",
        "category": "Kelulusan & Wisuda",
        "options": [
            {"id": "A", "text": "120 SKS"},
            {"id": "B", "text": "136 SKS"},
            {"id": "C", "text": "144 SKS"},
            {"id": "D", "text": "160 SKS"}
        ],
        "correct_id": "C",
        "explanation": "Beban studi program sarjana (S1) disyaratkan minimal 144 SKS yang mencakup mata kuliah wajib universitas, fakultas, program studi, dan tugas akhir/skripsi."
    },
    {
        "id": "q5",
        "question": "Berapa batas maksimal masa studi yang diperkenankan bagi mahasiswa Program Sarjana (S1) reguler?",
        "category": "Status Studi & DO",
        "options": [
            {"id": "A", "text": "10 Semester (5 Tahun)"},
            {"id": "B", "text": "12 Semester (6 Tahun)"},
            {"id": "C", "text": "14 Semester (7 Tahun)"},
            {"id": "D", "text": "16 Semester (8 Tahun)"}
        ],
        "correct_id": "C",
        "explanation": "Masa studi maksimal mahasiswa program sarjana adalah 14 semester (7 tahun). Melebihi batas ini tanpa kelulusan berakibat pada evaluasi Drop Out (DO)."
    },
    {
        "id": "q6",
        "question": "Apakah yang dimaksud dengan status evaluasi studi 4 semester pertama?",
        "category": "Evaluasi & Perkuliahan",
        "options": [
            {"id": "A", "text": "Mahasiswa wajib mengumpulkan minimal 40 SKS lulus dengan IPK >= 2.00"},
            {"id": "B", "text": "Mahasiswa wajib telah menyelesaikan skripsi"},
            {"id": "C", "text": "Mahasiswa wajib mempublikasikan jurnal internasional"},
            {"id": "D", "text": "Mahasiswa wajib mengikuti KKN"}
        ],
        "correct_id": "A",
        "explanation": "Pada evaluasi akhir 4 semester pertama, mahasiswa program sarjana disyaratkan telah mengumpulkan minimal 40 SKS terbaik tanpa nilai D/E berlebihan dengan IPK minimal 2.00."
    },
    {
        "id": "q7",
        "question": "Berapakah nilai mutu huruf 'A' dan 'B' dalam bobot angka indeks prestasi akademik?",
        "category": "Penilaian Akademik",
        "options": [
            {"id": "A", "text": "A = 4.00 dan B = 3.00"},
            {"id": "B", "text": "A = 4.00 dan B = 2.50"},
            {"id": "C", "text": "A = 3.75 dan B = 2.75"},
            {"id": "D", "text": "A = 100 dan B = 80"}
        ],
        "correct_id": "A",
        "explanation": "Sistem pembobotan nilai akademik menetapkan nilai huruf A setara 4.00 (Sangat Baik) dan B setara 3.00 (Baik)."
    }
]

class QuizService:
    def get_questions(self, count: int = 5) -> List[QuizQuestion]:
        """Mengambil daftar pertanyaan kuis akademik acak namun deterministik."""
        selected = ACADEMIC_QUIZ_BANK[:count]
        questions = []
        for q in selected:
            options = [QuizOption(id=opt["id"], text=opt["text"]) for opt in q["options"]]
            questions.append(
                QuizQuestion(
                    id=q["id"],
                    question=q["question"],
                    category=q["category"],
                    options=options
                )
            )
        return questions

    def submit_quiz(self, db: Session, request: QuizSubmitRequest) -> QuizSubmitResponse:
        """
        Memvalidasi jawaban kuis, menghitung skor, mencatat progres gamifikasi,
        memberikan reward XP terukur, dan memicu evaluasi achievement.
        """
        bank_map = {q["id"]: q for q in ACADEMIC_QUIZ_BANK}
        user = gamification_service.get_user(db, request.user_id or 1)

        reviews: List[QuizQuestionReview] = []
        correct_count = 0

        for ans in request.answers:
            q_data = bank_map.get(ans.question_id)
            if not q_data:
                continue

            is_correct = (ans.selected_option_id.upper() == q_data["correct_id"])
            if is_correct:
                correct_count += 1

            reviews.append(
                QuizQuestionReview(
                    question_id=ans.question_id,
                    question=q_data["question"],
                    category=q_data["category"],
                    user_selected_option_id=ans.selected_option_id.upper(),
                    correct_option_id=q_data["correct_id"],
                    is_correct=is_correct,
                    explanation=q_data["explanation"]
                )
            )

        total_q = len(reviews) if reviews else 1
        score_pct = round((correct_count / total_q) * 100, 1)

        # Hitung reward XP: +15 XP per jawaban benar (maksimal 75 XP per kuis)
        xp_earned = correct_count * 15

        level_up = False
        new_total_xp = user.total_xp
        current_lvl = user.level

        if xp_earned > 0:
            # Berikan XP reward secara transaksional
            new_total_xp, current_lvl, level_up = gamification_service.add_xp(
                db=db,
                user_id=user.id,
                amount=xp_earned,
                source="quiz_completed",
                description=f"Aktivitas Kuis Akademik: {correct_count}/{total_q} Benar ({score_pct}%)"
            )

        # Update quest_quiz di tabel quest_progress
        today = date.today()
        p = db.query(QuestProgress).filter(
            QuestProgress.user_id == user.id,
            QuestProgress.quest_id == "quest_quiz",
            QuestProgress.quest_date == today
        ).first()
        if p and not p.is_completed:
            p.current_count += 1
            if p.current_count >= 1:
                p.current_count = 1

        # Cek achievement Juara Kuis jika skor 100%
        if score_pct == 100.0:
            existing_ach = db.query(UserAchievement).filter(
                UserAchievement.user_id == user.id,
                UserAchievement.achievement_id == "ach_quiz_master"
            ).first()
            if not existing_ach:
                gamification_service._unlock_achievement(db, user, "ach_quiz_master")

        db.commit()

        return QuizSubmitResponse(
            success=True,
            total_questions=len(reviews),
            correct_count=correct_count,
            score_percentage=score_pct,
            xp_earned=xp_earned,
            level_up=level_up,
            new_total_xp=new_total_xp,
            current_level=current_lvl,
            review=reviews
        )

quiz_service = QuizService()
