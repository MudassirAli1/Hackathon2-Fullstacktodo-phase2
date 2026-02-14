from sqlmodel import SQLModel, Field, Column, DateTime
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


# Pydantic models for API requests and responses
class UserBase(SQLModel):
    email: str
    name: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = None


# Database model
class User(UserBase, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: Optional[str] = None
    hashed_password: str = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if 'created_at' not in kwargs or kwargs['created_at'] is None:
            self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()


# Response model (without hashed_password)
class UserResponse(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

    def dict(self, **kwargs):
        """Override dict to convert id to string for API responses"""
        d = super().dict(**kwargs)
        d['id'] = str(d['id'])
        return d


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: Optional[str] = None


class AuthRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None  # For signup


class AuthResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    user: Optional[UserResponse] = None
    error: Optional[str] = None


# JWT Token models for internal use
class JWTTokenData(BaseModel):
    user_id: str
    exp: int  # Expiration timestamp
    iat: int  # Issued at timestamp
    email: Optional[str] = None
    name: Optional[str] = None