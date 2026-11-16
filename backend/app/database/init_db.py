from datetime import date
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.models.base import Base
from app.models.user import User, UserLevel
from app.models.gamification import Achievement, DailyQuest, QuestProgress
from app.database.session import engine
from app.core.security import hash_password

DEFAULT_LEVELS = [
    {"level": 1, "title": "Mahasiswa Baru", "min_xp": 0, "max_xp": 99, "badge_icon": "badge_freshman"},
    {"level": 2, "title": "Penjelajah Kampus", "min_xp": 100, "max_xp": 249, "badge_icon": "badge_explorer"},
    {"level": 3, "title": "Cendekiawan Muda", "min_xp": 250, "max_xp": 499, "badge_icon": "badge_scholar"},
    {"level": 4, "title": "Pakar Regulasi", "min_xp": 500, "max_xp": 999, "badge_icon": "badge_expert"},
    {"level": 5, "title": "Master Akademik ITS", "min_xp": 1000, "max_xp": 99999, "badge_icon": "badge_master"}
]

DEFAULT_ACHIEVEMENTS = [
    {
        "id": "ach_first_question",
        "code": "FIRST_QUESTION",
        "title": "Langkah Perdana",
        "description": "Mengajukan pertanyaan pertama ke Academic Assistant",
        "badge_icon": "icon_first_chat",
        "xp_reward": 50,
        "category": "Akademik"
    },
    {
        "id": "ach_curious_mind",
        "code": "CURIOUS_MIND",
        "title": "Rasa Ingin Tahu Tinggi",
        "description": "Mengajukan 5 pertanyaan seputar pedoman akademik",
        "badge_icon": "icon_curious",
        "xp_reward": 100,
        "category": "Eksplorasi"
    },
    {
        "id": "ach_scholar_rank",
        "code": "SCHOLAR_RANK",
        "title": "Cendekiawan Muda",
        "description": "Berhasil meningkatkan level hingga Level 3",
        "badge_icon": "icon_scholar",
        "xp_reward": 150,
        "category": "Level"
    },
    {
        "id": "ach_quest_hunter",
        "code": "QUEST_HUNTER",
        "title": "Pemburu Quest",
        "description": "Menyelesaikan 3 Daily Quest pembelajaran",
        "badge_icon": "icon_trophy",
        "xp_reward": 200,
        "category": "Quest"
    },
    {
        "id": "ach_mastery",
        "code": "ACADEMIC_MASTERY",
        "title": "Master Regulasi Kampus",
        "description": "Mengumpulkan akumulasi total 500 XP",
        "badge_icon": "icon_crown",
        "xp_reward": 250,
        "category": "Prestasi"
    },
    {
        "id": "ach_cosine_expert",
        "code": "COSINE_EXPERT",
        "title": "Peneliti Presisi",
        "description": "Menemukan jawaban dengan kemiripan semantik tinggi (Cosine Similarity >= 0.70)",
        "badge_icon": "icon_target",
        "xp_reward": 100,
        "category": "Algoritma NLP"
    },
    {
        "id": "ach_fuzzy_explorer",
        "code": "FUZZY_EXPLORER",
        "title": "Detektif Saltik",
        "description": "Menemukan jawaban yang tepat melalui toleransi salah ketik (Fuzzy Matching >= 75%)",
        "badge_icon": "icon_sparkles",
        "xp_reward": 100,
        "category": "Algoritma NLP"
    },
    {
        "id": "ach_quiz_master",
        "code": "QUIZ_MASTER",
        "title": "Juara Kuis Akademik",
        "description": "Menyelesaikan tantangan kuis interaktif regulasi kampus",
        "badge_icon": "icon_award",
        "xp_reward": 150,
        "category": "Aktivitas Kuis"
    }
]

DEFAULT_QUESTS = [
    {
        "id": "quest_daily_login",
        "title": "Aktivitas Harian",
        "description": "Buka dan gunakan Academic Assistant hari ini",
        "target_count": 1,
        "xp_reward": 20,
        "category": "Kehadiran"
    },
    {
        "id": "quest_first_faq",
        "title": "Pencari Jawaban",
        "description": "Ajukan minimal 1 pertanyaan seputar panduan akademik",
        "target_count": 1,
        "xp_reward": 30,
        "category": "Akademik"
    },
    {
        "id": "quest_curriculum",
        "title": "Eksplorasi Kurikulum",
        "description": "Tanyakan 2 topik mengenai KRS, SKS, atau cuti kuliah",
        "target_count": 2,
        "xp_reward": 50,
        "category": "Studi"
    },
    {
        "id": "quest_feedback",
        "title": "Apresiasi Jawaban",
        "description": "Berikan rating atau feedback untuk jawaban chatbot",
        "target_count": 1,
        "xp_reward": 40,
        "category": "Kontribusi"
    },
    {
        "id": "quest_quiz",
        "title": "Tantangan Kuis",
        "description": "Ikuti dan selesaikan tantangan kuis interaktif regulasi kampus",
        "target_count": 1,
        "xp_reward": 50,
        "category": "Kuis"
    }
]

def init_db(db: Session) -> None:
    """
    Inisialisasi tabel SQLite, migrasi kolom jika tabel sudah ada,
    serta seeding data referensi gamifikasi dan akun demo pengujian.
    """
    bind = db.get_bind()
    Base.metadata.create_all(bind=bind)

    # 1. Migrasi Kolom SQLite jika tabel users sudah ada sebelumnya
    with bind.connect() as conn:
        try:
            res = conn.execute(text("PRAGMA table_info(users)")).fetchall()
            existing_cols = {row[1] for row in res}
            if existing_cols:
                if "nim" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN nim VARCHAR(32)"))
                if "hashed_password" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN hashed_password VARCHAR(255)"))
                if "is_demo" not in existing_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN is_demo BOOLEAN DEFAULT 0"))
                conn.commit()
        except Exception:
            pass

    # 2. Seed Levels
    for lvl in DEFAULT_LEVELS:
        existing = db.query(UserLevel).filter(UserLevel.level == lvl["level"]).first()
        if not existing:
            db.add(UserLevel(**lvl))

    # 3. Seed Achievements
    for ach in DEFAULT_ACHIEVEMENTS:
        existing = db.query(Achievement).filter(Achievement.id == ach["id"]).first()
        if not existing:
            db.add(Achievement(**ach))

    # 4. Seed Daily Quests
    for q in DEFAULT_QUESTS:
        existing = db.query(DailyQuest).filter(DailyQuest.id == q["id"]).first()
        if not existing:
            db.add(DailyQuest(**q))

    db.commit()

    # 5. Seed Akun Demo Terpisah untuk Keperluan Pengujian / Development
    demo_pw_hash = hash_password("DemoMahasiswa123!")
    demo_user = db.query(User).filter(User.id == 1).first()

    if not demo_user:
        demo_user = User(
            id=1,
            nim="5025211001",
            username="demo_mahasiswa",
            full_name="Mahasiswa Demo ITS",
            email="demo@its.ac.id",
            hashed_password=demo_pw_hash,
            is_demo=True,
            total_xp=0,
            level=1,
            current_streak=1
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
    else:
        # Perbarui akun demo ID 1 agar memiliki nim, hashed_password, dan flag is_demo=True
        updated = False
        if not demo_user.nim:
            demo_user.nim = "5025211001"
            updated = True
        if not demo_user.hashed_password:
            demo_user.hashed_password = demo_pw_hash
            updated = True
        if not demo_user.is_demo:
            demo_user.is_demo = True
            updated = True
        if updated:
            db.commit()

    # 6. Inisialisasi progress quest untuk akun demo
    today = date.today()
    for q in DEFAULT_QUESTS:
        existing_progress = db.query(QuestProgress).filter(
            QuestProgress.user_id == demo_user.id,
            QuestProgress.quest_id == q["id"],
            QuestProgress.quest_date == today
        ).first()
        if not existing_progress:
            initial_count = 1 if q["id"] == "quest_daily_login" else 0
            db.add(QuestProgress(
                user_id=demo_user.id,
                quest_id=q["id"],
                current_count=initial_count,
                is_completed=False,
                quest_date=today
            ))
    db.commit()
