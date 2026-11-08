from typing import Optional
from pydantic import BaseModel, field_validator

class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "citizen"
    district_id: Optional[int] = None
    home_zone_id: Optional[int] = None

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Invalid email format.")
        return v

class UserLoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return v.strip().lower()

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    district_id: Optional[int] = None
    home_zone_id: Optional[int] = None
    email_alerts: bool = False

    class Config:
        from_attributes = True

class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    district_id: Optional[int] = None
    home_zone_id: Optional[int] = None
    email_alerts: Optional[bool] = None

class TokenResponse(BaseModel):
    token: str
    user: UserResponse
