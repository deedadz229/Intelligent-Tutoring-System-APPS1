from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.gamification import XPTransaction, UserAchievement

def test_quest_completion_and_xp_awarded(client: TestClient, db_session: Session):
    """
    Test Case 11: Quest berhasil diselesaikan dan XP diberikan
    Memeriksa klaim quest POST /api/gamification/quests/{quest_id}/complete
    menambahkan XP dan tercatat di database secara persisten.
    """
    user = db_session.query(User).filter(User.id == 1).first()
    initial_xp = user.total_xp

    # Selesaikan quest 'quest_daily_login' (reward: 20 XP)
    response = client.post("/api/gamification/quests/quest_daily_login/complete?user_id=1")
    assert response.status_code == 200

    data = response.json()
    assert data["success"] is True
    assert data["xp_awarded"] == 20
    assert data["new_total_xp"] == initial_xp + 20

    # Verifikasi langsung ke database
    db_session.refresh(user)
    assert user.total_xp == initial_xp + 20

    # Verifikasi ada transaksi XP di tabel xp_transactions
    tx = db_session.query(XPTransaction).filter(
        XPTransaction.user_id == 1,
        XPTransaction.source == "quest_complete"
    ).first()
    assert tx is not None
    assert tx.amount == 20


def test_badge_and_progress_updated(client: TestClient, db_session: Session):
    """
    Test Case 12: Badge dan progress diperbarui
    Memeriksa profil dan progres level diperbarui seiring penambahan XP dan pencapaian.
    """
    # Berikan XP agar naik level ke level 2 (>= 100 XP)
    user = db_session.query(User).filter(User.id == 1).first()
    user.total_xp = 120
    user.level = 2
    db_session.commit()

    # Periksa GET /api/gamification/profile
    profile_resp = client.get("/api/gamification/profile?user_id=1")
    assert profile_resp.status_code == 200
    p_data = profile_resp.json()
    assert p_data["level"] == 2
    assert p_data["level_title"] == "Penjelajah Kampus"
    assert p_data["badge_icon"] == "badge_explorer"
    assert p_data["total_xp"] == 120
    assert p_data["progress_percentage"] > 0.0

    # Periksa GET /api/gamification/progress
    prog_resp = client.get("/api/gamification/progress?user_id=1")
    assert prog_resp.status_code == 200
    pr_data = prog_resp.json()
    assert pr_data["level"] == 2
    assert pr_data["daily_quests_total"] >= 4


def test_anti_spam_xp_policy(client: TestClient, db_session: Session):
    """
    Memastikan XP memiliki batas harian (maksimal 10 query yang mendapat direct reward per hari).
    Setelah batas harian tercapai, pertanyaan berikutnya memberikan 0 direct XP sehingga
    mencegah bot spamming / farming XP.
    """
    user = db_session.query(User).filter(User.id == 1).first()

    # Kirim 10 pertanyaan hingga mencapai limit harian
    for _ in range(10):
        res = client.post("/api/process", json={"question": "Bagaimana cara mengajukan cuti?", "user_id": 1})
        assert res.status_code == 200

    db_session.refresh(user)
    xp_after_limit = user.total_xp

    # Kirim pertanyaan ke-11 dan ke-12 yang melampaui batas harian
    for _ in range(2):
        res = client.post("/api/process", json={"question": "Bagaimana cara mengajukan cuti?", "user_id": 1})
        assert res.status_code == 200
        data = res.json()
        assert data["xp_earned"] == 0

    db_session.refresh(user)
    # Total XP tidak boleh bertambah karena batas harian anti-spam telah aktif
    assert user.total_xp == xp_after_limit


def test_quiz_endpoints(client: TestClient, db_session: Session):
    """Menguji endpoint kuis interaktif regulasi akademik dan reward validasi jawaban."""
    # 1. Ambil soal kuis
    resp = client.get("/api/quiz/questions?count=3")
    assert resp.status_code == 200
    questions = resp.json()
    assert len(questions) == 3
    for q in questions:
        assert "id" in q
        assert "question" in q
        assert "category" in q
        assert len(q["options"]) == 4

    # 2. Kirim jawaban kuis
    submit_payload = {
        "user_id": 1,
        "answers": [
            {"question_id": questions[0]["id"], "selected_option_id": "C"},
            {"question_id": questions[1]["id"], "selected_option_id": "B"}
        ]
    }
    submit_resp = client.post("/api/quiz/submit", json=submit_payload)
    assert submit_resp.status_code == 200
    sub_data = submit_resp.json()
    assert sub_data["success"] is True
    assert sub_data["total_questions"] == 2
    assert "correct_count" in sub_data
    assert "xp_earned" in sub_data
    assert len(sub_data["review"]) == 2
    for r in sub_data["review"]:
        assert "explanation" in r
        assert "is_correct" in r


def test_gamification_leaderboard(client: TestClient, db_session: Session):
    """Memeriksa endpoint leaderboard mengurutkan peringkat pengguna berdasarkan akumulasi XP."""
    # Buat pengguna kedua dengan XP lebih tinggi
    user2 = User(
        id=2,
        nim="5025211999",
        username="top_student",
        full_name="Mahasiswa Berprestasi",
        email="top@its.ac.id",
        hashed_password="hash_top_student",
        is_demo=False,
        total_xp=450,
        level=3,
        current_streak=5
    )
    db_session.add(user2)
    db_session.commit()

    resp = client.get("/api/gamification/leaderboard")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_users"] >= 2
    leaderboard = data["leaderboard"]
    assert len(leaderboard) >= 2
    # Peringkat 1 harus user dengan XP tertinggi (top_student)
    assert leaderboard[0]["user_id"] == 2
    assert leaderboard[0]["total_xp"] == 450
    assert leaderboard[0]["rank"] == 1


def test_cannot_complete_same_quest_twice(client: TestClient, db_session: Session):
    """Memeriksa bahwa quest yang sudah selesai tidak dapat diklaim ulang pada hari yang sama."""
    # Klaim pertama
    res1 = client.post("/api/gamification/quests/quest_daily_login/complete?user_id=1")
    assert res1.status_code == 200

    # Klaim kedua harus ditolak
    res2 = client.post("/api/gamification/quests/quest_daily_login/complete?user_id=1")
    assert res2.status_code == 400
    assert "sudah diselesaikan" in res2.json()["detail"].lower()
