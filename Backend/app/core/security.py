from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
import bcrypt
import hashlib
from app.core.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    验证密码
    支持两种模式：
    1. 前端SHA256加密后的密码（64位十六进制字符串）
    2. 纯文本密码（向后兼容）
    """
    # 检查是否是SHA256哈希（64位十六进制字符串）
    is_sha256 = len(plain_password) == 64 and all(c in '0123456789abcdef' for c in plain_password.lower())
    
    if is_sha256:
        # 前端已经SHA256加密，直接比较（因为数据库存储的是bcrypt(SHA256(密码))）
        return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())
    else:
        # 纯文本密码，先SHA256再验证
        sha256_password = hashlib.sha256(plain_password.encode()).hexdigest()
        return bcrypt.checkpw(sha256_password.encode(), hashed_password.encode())


def get_password_hash(password: str) -> str:
    """
    对密码进行bcrypt加密
    如果密码已经是SHA256格式（64位十六进制），直接bcrypt
    否则先SHA256再bcrypt
    """
    # 检查是否已经是SHA256哈希
    is_sha256 = len(password) == 64 and all(c in '0123456789abcdef' for c in password.lower())
    
    if is_sha256:
        # 已经是SHA256哈希，直接bcrypt
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    else:
        # 纯文本密码，先SHA256再bcrypt
        sha256_password = hashlib.sha256(password.encode()).hexdigest()
        return bcrypt.hashpw(sha256_password.encode(), bcrypt.gensalt()).decode()


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def create_refresh_token(subject: str) -> str:
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def create_tokens(user_id: int) -> dict:
    access_token = create_access_token(subject=str(user_id))
    refresh_token = create_refresh_token(subject=str(user_id))
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


def create_password_reset_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode = {"exp": expire, "sub": email, "type": "password_reset"}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def verify_password_reset_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("type") != "password_reset":
            return None
        return payload.get("sub")
    except JWTError:
        return None
