from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, ChangePasswordRequest, Token, UserInToken
from app.services.auth import AuthService, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    token, user = AuthService.login(db, data.username, data.password)
    return Token(
        access_token=token,
        user=UserInToken(id=str(user.id), username=user.username, role=user.role),
    )


@router.post("/change-password", status_code=204)
def change_password(
    data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    AuthService.change_password(
        db, current_user, data.current_password, data.new_password
    )
