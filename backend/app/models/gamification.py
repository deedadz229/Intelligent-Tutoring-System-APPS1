from datetime import datetime, date, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class XPTransaction(Base):
    __tablename__ = "xp_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)
    source = Column(String(64), nullable=False)  # quest_complete, achievement_unlocked, daily_login
    description = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="xp_transactions")


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String(64), primary_key=True)
    code = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(128), nullable=False)
    description = Column(String(255), nullable=False)
    badge_icon = Column(String(64), nullable=False)
    xp_reward = Column(Integer, default=50, nullable=False)
    category = Column(String(64), default="General", nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement", cascade="all, delete-orphan")


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    achievement_id = Column(String(64), ForeignKey("achievements.id"), nullable=False, index=True)
    unlocked_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="user_achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")


class DailyQuest(Base):
    __tablename__ = "daily_quests"

    id = Column(String(64), primary_key=True)
    title = Column(String(128), nullable=False)
    description = Column(String(255), nullable=False)
    target_count = Column(Integer, default=1, nullable=False)
    xp_reward = Column(Integer, default=50, nullable=False)
    category = Column(String(64), default="Akademik", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    progress_entries = relationship("QuestProgress", back_populates="quest", cascade="all, delete-orphan")


class QuestProgress(Base):
    __tablename__ = "quest_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    quest_id = Column(String(64), ForeignKey("daily_quests.id"), nullable=False, index=True)
    current_count = Column(Integer, default=0, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    quest_date = Column(Date, default=date.today, nullable=False, index=True)

    # Relationships
    user = relationship("User", back_populates="quest_progress")
    quest = relationship("DailyQuest", back_populates="progress_entries")
