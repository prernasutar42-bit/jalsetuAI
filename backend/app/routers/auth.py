import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
    check_login_rate_limit,
    reset_login_rate_limit,
)
from backend.app.core.errors import AppException
from backend.app.models.user import User
from backend.app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    UserUpdateRequest,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message="Missing or invalid authentication credentials.",
        )
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message="Token has expired or is invalid.",
        )

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="USER_NOT_FOUND",
            message="Authenticated user could not be found.",
        )
    return user

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise AppException(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            message="Administrative privileges required to access this resource.",
        )
    return current_user

@router.post("/register", response_model=TokenResponse)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower().strip()).first()
    if existing:
        raise AppException(
            status_code=status.HTTP_400_BAD_REQUEST,
            code="EMAIL_ALREADY_EXISTS",
            message="An account with this email address is already registered.",
        )

    zone_id = req.home_zone_id or req.district_id or 1
    new_user = User(
        id=f"usr-{uuid.uuid4().hex[:12]}",
        name=req.name.strip(),
        email=req.email.lower().strip(),
        password_hash=get_password_hash(req.password),
        role=req.role if req.role in ["citizen", "admin"] else "citizen",
        home_zone_id=zone_id,
        email_alerts=False,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token({
        "sub": new_user.id,
        "email": new_user.email,
        "name": new_user.name,
        "role": new_user.role,
        "district_id": new_user.home_zone_id,
    })

    return TokenResponse(
        token=token,
        user=UserResponse(
            id=new_user.id,
            name=new_user.name,
            email=new_user.email,
            role=new_user.role,
            district_id=new_user.home_zone_id,
            home_zone_id=new_user.home_zone_id,
            email_alerts=new_user.email_alerts,
        ),
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    email_clean = req.email.lower().strip()

    # Rate limiting check on login attempts
    if not check_login_rate_limit(email_clean):
        raise AppException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            code="RATE_LIMITED",
            message="Too many failed login attempts. Please wait 60 seconds before trying again.",
        )

    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise AppException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="INVALID_CREDENTIALS",
            message="Invalid email address or password.",
        )

    reset_login_rate_limit(email_clean)

    token = create_access_token({
        "sub": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "district_id": user.home_zone_id,
    })

    return TokenResponse(
        token=token,
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            district_id=user.home_zone_id,
            home_zone_id=user.home_zone_id,
            email_alerts=user.email_alerts,
        ),
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        district_id=current_user.home_zone_id,
        home_zone_id=current_user.home_zone_id,
        email_alerts=current_user.email_alerts,
    )

@router.patch("/me", response_model=UserResponse)
def update_me(
    req: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.name is not None:
        current_user.name = req.name.strip()
    if req.district_id is not None:
        current_user.home_zone_id = req.district_id
    elif req.home_zone_id is not None:
        current_user.home_zone_id = req.home_zone_id
    if req.email_alerts is not None:
        current_user.email_alerts = req.email_alerts

    db.commit()
    db.refresh(current_user)

    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        district_id=current_user.home_zone_id,
        home_zone_id=current_user.home_zone_id,
        email_alerts=current_user.email_alerts,
    )
