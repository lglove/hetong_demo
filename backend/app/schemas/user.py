from datetime import datetime
from uuid import UUID
from pydantic import BaseModel
from app.models.user import UserRole


class UserCreate(BaseModel):
    username: str
    password: str
    role: UserRole = UserRole.normal


class UserUpdate(BaseModel):
    password: str | None = None
    role: UserRole | None = None


class UserResponse(BaseModel):
    id: UUID
    username: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True
