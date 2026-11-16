from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.session import get_db
from app.models.user import User
from app.models.gamification import DailyQuest, QuestProgress
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserProfileResponse
from app.core.security import hash_password, verify_password, create_access_token
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Registrasi Akun Mahasiswa Baru"
)
def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Pendaftaran akun mahasiswa baru dengan validasi keunikan NIM, email, dan username.
    Password disimpan secara aman dalam bentuk hash bcrypt (tidak pernah disimpan plaintext).
    """
    # 1. Validasi Keunikan NIM
    if db.query(User).filter(User.nim == payload.nim).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"NIM '{payload.nim}' sudah terdaftar. Silakan gunakan NIM lain atau login."
        )

    # 2. Validasi Keunikan Email
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email '{payload.email}' sudah terdaftar dalam sistem."
        )

    # 3. Validasi Keunikan Username
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{payload.username}' sudah digunakan. Silakan pilih username lain."
        )

    # 4. Hash Password dengan Bcrypt
    hashed_pw = hash_password(payload.password)

    # 5. Buat Record Mahasiswa Baru (is_demo=False)
    new_user = User(
        nim=payload.nim,
        username=payload.username,
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hashed_pw,
        is_demo=False,
        total_xp=0,
        level=1,
        current_streak=1,
        last_active_date=date.today()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 6. Inisialisasi Progres Quest Harian untuk Mahasiswa Baru
    today = date.today()
    active_quests = db.query(DailyQuest).filter(DailyQuest.is_active == True).all()
    for q in active_quests:
        initial_count = 1 if q.id == "quest_daily_login" else 0
        db.add(QuestProgress(
            user_id=new_user.id,
            quest_id=q.id,
            current_count=initial_count,
            is_completed=False,
            quest_date=today
        ))
    db.commit()

    # 7. Generate JWT Access Token
    token = create_access_token(data={"sub": str(new_user.id), "username": new_user.username})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfileResponse.model_validate(new_user)
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login Mahasiswa"
)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Login menggunakan Username, Email, atau NIM beserta password.
    Memverifikasi hash bcrypt dan menerbitkan JWT Bearer Token.
    """
    ident = payload.username_or_email.strip()
    user = db.query(User).filter(
        or_(
            User.username == ident,
            User.email == ident,
            User.nim == ident
        )
    ).first()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="NIM/Username/Email atau password salah. Silakan periksa kembali."
        )

    # Update tanggal aktif terakhir
    user.last_active_date = date.today()
    user.updated_at = datetime.now(timezone.utc)
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "username": user.username})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfileResponse.model_validate(user)
    )


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Profil Pengguna yang Sedang Login"
)
def get_me(
    current_user: User = Depends(get_current_user)
) -> UserProfileResponse:
    """Mengembalikan data profil mahasiswa yang terautentikasi melalui JWT token."""
    return UserProfileResponse.model_validate(current_user)


@router.post(
    "/logout",
    summary="Logout Mahasiswa"
)
def logout(
    current_user: User = Depends(get_current_user)
):
    """Mekanisme logout aman (klien menghapus token autentikasi lokal)."""
    return {
        "success": True,
        "message": f"Pengguna {current_user.username} berhasil logout."
    }
