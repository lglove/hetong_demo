from pydantic import BaseModel
from app.models.user import UserRole


class LoginRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UserInToken(BaseModel):
    id: str
    username: str
    role: UserRole


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserInToken


class TokenPayload(BaseModel):
    sub: str  # user id
    username: str
    role: str
    exp: int
