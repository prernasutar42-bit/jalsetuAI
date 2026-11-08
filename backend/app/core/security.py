import time
from datetime import datetime, timedelta
from typing import Optional, Dict, List
from jose import JWTError, jwt
from passlib.context import CryptContext
from backend.app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory simple rate limiter for login attempts
# Tracks identifier (IP or email) -> list of request timestamps
_login_attempts: Dict[str, List[float]] = {}
RATE_LIMIT_WINDOW_SECONDS = 60
MAX_ATTEMPTS_PER_WINDOW = 5

def check_login_rate_limit(identifier: str) -> bool:
    """Returns True if within rate limit, False if exceeded."""
    now = time.time()
    attempts = _login_attempts.get(identifier, [])
    # Filter attempts within the sliding window
    valid_attempts = [t for t in attempts if now - t < RATE_LIMIT_WINDOW_SECONDS]
    if len(valid_attempts) >= MAX_ATTEMPTS_PER_WINDOW:
        _login_attempts[identifier] = valid_attempts
        return False
    valid_attempts.append(now)
    _login_attempts[identifier] = valid_attempts
    return True

def reset_login_rate_limit(identifier: str):
    if identifier in _login_attempts:
        del _login_attempts[identifier]

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
