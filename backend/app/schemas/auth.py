from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=128, description="Nama lengkap mahasiswa")
    nim: str = Field(..., min_length=5, max_length=32, description="Nomor Induk Mahasiswa (NIM) unik")
    email: EmailStr = Field(..., description="Alamat email aktif universitas atau pribadi")
    username: str = Field(..., min_length=3, max_length=64, description="Username unik")
    password: str = Field(..., min_length=6, max_length=128, description="Password minimal 6 karakter")

    @field_validator("nim", "username")
    @classmethod
    def validate_identifier(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Field tidak boleh kosong atau hanya berisi spasi.")
        return clean


class LoginRequest(BaseModel):
    username_or_email: str = Field(..., min_length=3, description="Username, Email, atau NIM")
    password: str = Field(..., min_length=1, description="Password akun")


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nim: str
    username: str
    full_name: str
    email: str
    is_demo: bool
    total_xp: int
    level: int
    current_streak: int
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str = Field(..., description="JWT Bearer Token")
    token_type: str = Field(default="bearer", description="Jenis token autentikasi")
    user: UserProfileResponse = Field(..., description="Data profil pengguna yang login")
