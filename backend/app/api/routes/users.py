from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserCreate
from app.core.security import hash_password
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me", response_model=UserResponse, summary="Data Profil Mahasiswa yang Sedang Login")
def get_user_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """Mengembalikan data profil mahasiswa terautentikasi."""
    return current_user

@router.get("/{user_id}", response_model=UserResponse, summary="Ambil Data Pengguna berdasarkan ID")
def get_user_by_id(user_id: int, db: Session = Depends(get_db)) -> UserResponse:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pengguna dengan ID {user_id} tidak ditemukan."
        )
    return user

@router.get("", response_model=List[UserResponse], summary="Daftar Pengguna")
def list_users(limit: int = 20, db: Session = Depends(get_db)) -> List[UserResponse]:
    return db.query(User).limit(limit).all()

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Buat Pengguna Baru")
def create_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    existing = db.query(User).filter(
        (User.username == payload.username) | (User.email == payload.email) | (User.nim == payload.nim)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="NIM, username, atau email sudah terdaftar."
        )
    user = User(
        nim=payload.nim,
        username=payload.username,
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        is_demo=False,
        total_xp=0,
        level=1,
        current_streak=1
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
