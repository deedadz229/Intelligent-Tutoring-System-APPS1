from datetime import datetime, date, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date
from sqlalchemy.orm import relationship

from app.models.base import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nim = Column(String(32), unique=True, index=True, nullable=False)
    username = Column(String(64), unique=True, index=True, nullable=False)
    full_name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_demo = Column(Boolean, default=False, nullable=False)
    total_xp = Column(Integer, default=0, nullable=False)
    level = Column(Integer, default=1, nullable=False)
    current_streak = Column(Integer, default=1, nullable=False)
    last_active_date = Column(Date, default=date.today)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now, nullable=False)

    # Relationships
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("UserFeedback", back_populates="user", cascade="all, delete-orphan")
    xp_transactions = relationship("XPTransaction", back_populates="user", cascade="all, delete-orphan")
    user_achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    quest_progress = relationship("QuestProgress", back_populates="user", cascade="all, delete-orphan")


class UserLevel(Base):
    __tablename__ = "user_levels"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, unique=True, nullable=False)
    title = Column(String(64), nullable=False)
    min_xp = Column(Integer, nullable=False)
    max_xp = Column(Integer, nullable=False)
    badge_icon = Column(String(64), nullable=False)
