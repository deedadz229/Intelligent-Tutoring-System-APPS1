from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.services.gamification_service import gamification_service
from app.schemas.gamification import (
    UserProfileResponse,
    ProgressResponse,
    AchievementsResponse,
    QuestsResponse,
    CompleteQuestResponse,
    LeaderboardResponse
)
from app.models.user import User
from app.api.deps import get_optional_user

router = APIRouter(prefix="/api/gamification", tags=["Gamification"])

@router.get(
    "/profile",
    response_model=UserProfileResponse,
    summary="Profil Gamifikasi Mahasiswa"
)
def get_gamification_profile(
    user_id: Optional[int] = Query(default=None, description="ID Mahasiswa opsional"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
) -> UserProfileResponse:
    """Mengembalikan data profil mahasiswa, level dinamis, XP akumulatif, dan progres level."""
    target_id = current_user.id if current_user else (user_id or 1)
    try:
        return gamification_service.get_profile(db=db, user_id=target_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/progress",
    response_model=ProgressResponse,
    summary="Progres Level dan Aktivitas Belajar"
)
def get_gamification_progress(
    user_id: Optional[int] = Query(default=None, description="ID Mahasiswa opsional"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
) -> ProgressResponse:
    """Mengembalikan rincian progres bar level, quest harian terselesaikan, dan pencapaian."""
    target_id = current_user.id if current_user else (user_id or 1)
    try:
        return gamification_service.get_progress(db=db, user_id=target_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/achievements",
    response_model=AchievementsResponse,
    summary="Daftar Badges dan Achievements"
)
def get_achievements(
    user_id: Optional[int] = Query(default=None, description="ID Mahasiswa opsional"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
) -> AchievementsResponse:
    """Mengembalikan seluruh daftar badge pencapaian beserta status unlock pengguna."""
    target_id = current_user.id if current_user else (user_id or 1)
    try:
        return gamification_service.get_achievements(db=db, user_id=target_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/quests",
    response_model=QuestsResponse,
    summary="Daftar Daily Quests"
)
def get_daily_quests(
    user_id: Optional[int] = Query(default=None, description="ID Mahasiswa opsional"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
) -> QuestsResponse:
    """Mengembalikan daftar quest harian, target, dan progres aktivitas hari ini."""
    target_id = current_user.id if current_user else (user_id or 1)
    try:
        return gamification_service.get_quests(db=db, user_id=target_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/quests/{quest_id}/complete",
    response_model=CompleteQuestResponse,
    summary="Klaim Penyelesaian Daily Quest"
)
def complete_quest(
    quest_id: str,
    user_id: Optional[int] = Query(default=None, description="ID Mahasiswa opsional"),
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
) -> CompleteQuestResponse:
    """
    Menyelesaikan quest dan mengklaim reward XP secara valid di backend.
    Nilai XP ditentukan dan divalidasi sepenuhnya oleh server (anti-cheat).
    """
    target_id = current_user.id if current_user else (user_id or 1)
    try:
        res = gamification_service.complete_quest(db=db, quest_id=quest_id, user_id=target_id)
        if not res.success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=res.message
            )
        return res
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/leaderboard",
    response_model=LeaderboardResponse,
    summary="Peringkat Leaderboard Mahasiswa"
)
def get_leaderboard(
    limit: int = Query(default=10, ge=1, le=50, description="Jumlah data peringkat"),
    db: Session = Depends(get_db)
) -> LeaderboardResponse:
    """Mengembalikan daftar leaderboard seluruh mahasiswa berdasarkan total akumulasi XP."""
    return gamification_service.get_leaderboard(db=db, limit=limit)
