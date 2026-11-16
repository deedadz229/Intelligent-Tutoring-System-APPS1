import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.chat import ChatHistory
from app.core.security import verify_password

def test_registration_and_validation(client: TestClient, db_session: Session):
    """Pengujian alur registrasi mahasiswa dengan validasi keunikan NIM, email, username."""
    reg_payload = {
        "full_name": "Ahmad Dahlan",
        "nim": "5025211050",
        "email": "ahmad@its.ac.id",
        "username": "ahmad_d",
        "password": "PasswordAhmad123!"
    }
    resp = client.post("/api/auth/register", json=reg_payload)
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["nim"] == "5025211050"
    assert data["user"]["username"] == "ahmad_d"
    assert data["user"]["is_demo"] is False

    # 1. Password disimpan dalam bentuk hash bcrypt (bukan plain text)
    db_user = db_session.query(User).filter(User.nim == "5025211050").first()
    assert db_user is not None
    assert db_user.hashed_password != "PasswordAhmad123!"
    assert db_user.hashed_password.startswith("$2b$")
    assert verify_password("PasswordAhmad123!", db_user.hashed_password) is True

    # 2. Coba registrasi ulang dengan NIM sama -> harus ditolak 400
    duplicate_nim = reg_payload.copy()
    duplicate_nim["email"] = "ahmad_other@its.ac.id"
    duplicate_nim["username"] = "ahmad_2"
    resp_dup_nim = client.post("/api/auth/register", json=duplicate_nim)
    assert resp_dup_nim.status_code == 400
    assert "NIM" in resp_dup_nim.json()["detail"]

    # 3. Coba registrasi ulang dengan Email sama -> harus ditolak 400
    duplicate_email = reg_payload.copy()
    duplicate_email["nim"] = "5025211051"
    duplicate_email["username"] = "ahmad_3"
    resp_dup_email = client.post("/api/auth/register", json=duplicate_email)
    assert resp_dup_email.status_code == 400
    assert "Email" in resp_dup_email.json()["detail"]

    # 4. Coba registrasi ulang dengan Username sama -> harus ditolak 400
    duplicate_username = reg_payload.copy()
    duplicate_username["nim"] = "5025211052"
    duplicate_username["email"] = "ahmad_4@its.ac.id"
    resp_dup_user = client.post("/api/auth/register", json=duplicate_username)
    assert resp_dup_user.status_code == 400
    assert "Username" in resp_dup_user.json()["detail"]


def test_login_flow(client: TestClient, db_session: Session):
    """Pengujian alur login dengan username, email, dan NIM."""
    reg_payload = {
        "full_name": "Budi Santoso",
        "nim": "5025211088",
        "email": "budi@its.ac.id",
        "username": "budi_s",
        "password": "BudiPassword123!"
    }
    client.post("/api/auth/register", json=reg_payload)

    # 1. Login menggunakan Username
    login_user = client.post("/api/auth/login", json={"username_or_email": "budi_s", "password": "BudiPassword123!"})
    assert login_user.status_code == 200
    assert "access_token" in login_user.json()

    # 2. Login menggunakan Email
    login_email = client.post("/api/auth/login", json={"username_or_email": "budi@its.ac.id", "password": "BudiPassword123!"})
    assert login_email.status_code == 200

    # 3. Login menggunakan NIM
    login_nim = client.post("/api/auth/login", json={"username_or_email": "5025211088", "password": "BudiPassword123!"})
    assert login_nim.status_code == 200

    # 4. Login password salah -> 401
    login_wrong = client.post("/api/auth/login", json={"username_or_email": "budi_s", "password": "WrongPassword!"})
    assert login_wrong.status_code == 401


def test_get_me_profile_isolation(client: TestClient, db_session: Session):
    """Memeriksa /api/auth/me mengembalikan profil mahasiswa terautentikasi."""
    # Tanpa token -> 401
    resp_no_token = client.get("/api/auth/me")
    assert resp_no_token.status_code == 401

    # Buat mahasiswa
    reg_resp = client.post("/api/auth/register", json={
        "full_name": "Citra Lestari",
        "nim": "5025211099",
        "email": "citra@its.ac.id",
        "username": "citra_l",
        "password": "CitraPassword123!"
    })
    token = reg_resp.json()["access_token"]

    # Dengan Bearer token -> 200 profil Citra
    resp_with_token = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp_with_token.status_code == 200
    assert resp_with_token.json()["nim"] == "5025211099"
    assert resp_with_token.json()["username"] == "citra_l"


def test_student_data_isolation(client: TestClient, db_session: Session):
    """
    PENGUJIAN KRUSIAL ISOLASI DATA MAHASISWA:
    - Mahasiswa A dan Mahasiswa B memiliki akun terpisah.
    - Pertanyaan dan riwayat chat Mahasiswa A TIDAK BISA diakses oleh Mahasiswa B.
    - XP Mahasiswa A bertambah, sementara XP Mahasiswa B tetap 0.
    - Progres quest Mahasiswa A tidak mempengaruhi Mahasiswa B.
    """
    # 1. Registrasi Mahasiswa A
    reg_a = client.post("/api/auth/register", json={
        "full_name": "Mahasiswa A",
        "nim": "5025211011",
        "email": "mhs_a@its.ac.id",
        "username": "mhs_a",
        "password": "PasswordA123!"
    })
    token_a = reg_a.json()["access_token"]
    user_id_a = reg_a.json()["user"]["id"]

    # 2. Registrasi Mahasiswa B
    reg_b = client.post("/api/auth/register", json={
        "full_name": "Mahasiswa B",
        "nim": "5025211022",
        "email": "mhs_b@its.ac.id",
        "username": "mhs_b",
        "password": "PasswordB123!"
    })
    token_b = reg_b.json()["access_token"]
    user_id_b = reg_b.json()["user"]["id"]

    assert user_id_a != user_id_b

    # 3. Mahasiswa A bertanya di Chatbot
    chat_resp_a = client.post(
        "/api/process",
        json={"question": "Bagaimana cara mengajukan cuti?", "user_id": user_id_a},
        headers={"Authorization": f"Bearer {token_a}"}
    )
    assert chat_resp_a.status_code == 200
    assert chat_resp_a.json()["xp_earned"] > 0

    # 4. Verifikasi riwayat chat Mahasiswa A
    history_a = client.get("/api/chat/history", headers={"Authorization": f"Bearer {token_a}"})
    assert history_a.status_code == 200
    chats_a = history_a.json()
    assert len(chats_a) == 1
    assert "cuti" in chats_a[0]["question"].lower()

    # 5. Verifikasi riwayat chat Mahasiswa B -> HARUS KOSONG (0)!
    history_b = client.get("/api/chat/history", headers={"Authorization": f"Bearer {token_b}"})
    assert history_b.status_code == 200
    chats_b = history_b.json()
    assert len(chats_b) == 0, "Riwayat chat Mahasiswa B harus kosong, data antar-mahasiswa tidak boleh bocor!"

    # 6. Verifikasi XP Mahasiswa B -> HARUS 0!
    prof_b = client.get("/api/gamification/profile", headers={"Authorization": f"Bearer {token_b}"})
    assert prof_b.status_code == 200
    assert prof_b.json()["total_xp"] == 0
    assert prof_b.json()["user_id"] == user_id_b

    # 7. Verifikasi XP Mahasiswa A -> Bertambah!
    prof_a = client.get("/api/gamification/profile", headers={"Authorization": f"Bearer {token_a}"})
    assert prof_a.status_code == 200
    assert prof_a.json()["total_xp"] > 0
    assert prof_a.json()["user_id"] == user_id_a
