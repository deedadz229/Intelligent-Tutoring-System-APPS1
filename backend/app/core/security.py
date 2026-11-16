import html
import re
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import bcrypt
import jwt

from app.core.config import settings

def sanitize_user_input(text: str) -> str:
    """
    Sanitize input text to prevent XSS and excessive control characters
    while preserving standard academic query text.
    """
    if not text:
        return ""
    # Strip HTML tags
    clean = re.sub(r"<[^>]*>", "", text)
    # Unescape HTML entities if any
    clean = html.unescape(clean)
    # Strip extra whitespace
    return clean.strip()


def hash_password(password: str) -> str:
    """Hash password menggunakan algoritma bcrypt dengan salt otomatis."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifikasi kecocokan password plaintext terhadap hash bcrypt."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Membuat JWT access token dengan durasi kedaluwarsa terukur."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode dan verifikasi integritas JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None
