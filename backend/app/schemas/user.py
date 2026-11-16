from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class UserBase(BaseModel):
    nim: str = Field(..., min_length=5, max_length=32)
    username: str = Field(..., min_length=3, max_length=64)
    full_name: str = Field(..., min_length=2, max_length=128)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)

class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_demo: bool = False
    total_xp: int
    level: int
    current_streak: int
    created_at: datetime
    updated_at: datetime
