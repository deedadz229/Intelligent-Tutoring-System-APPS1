from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base

def get_utc_now():
    return datetime.now(timezone.utc)

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    question = Column(String(1000), nullable=False)
    answer = Column(Text, nullable=True)
    category = Column(String(128), nullable=True)
    match_method = Column(String(64), nullable=True)
    score = Column(Float, nullable=True)
    matched_question = Column(String(1000), nullable=True)
    execution_time_ms = Column(Float, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="chat_history")
    feedback = relationship("UserFeedback", back_populates="chat", uselist=False, cascade="all, delete-orphan")


class UserFeedback(Base):
    __tablename__ = "user_feedback"

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chat_history.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    rating = Column(Integer, nullable=False)  # 1 to 5
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now, nullable=False)

    # Relationships
    chat = relationship("ChatHistory", back_populates="feedback")
    user = relationship("User", back_populates="feedbacks")
