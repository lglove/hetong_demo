"""用户 CRUD，仅超级管理员可调用。"""
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.services.auth import hash_password


class UserService:
    @staticmethod
    def list_users(db: Session) -> list[User]:
        return db.query(User).order_by(User.created_at.desc()).all()

    @staticmethod
    def get_user(db: Session, user_id: UUID) -> User | None:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create_user(db: Session, data: UserCreate, creator_id: UUID) -> User:
        if db.query(User).filter(User.username == data.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在",
            )
        user = User(
            username=data.username,
            password_hash=hash_password(data.password),
            role=data.role,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user(
        db: Session, user_id: UUID, data: UserUpdate, current_user_id: UUID
    ) -> User:
        user = UserService.get_user(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在",
            )
        if data.password is not None:
            user.password_hash = hash_password(data.password)
        if data.role is not None:
            user.role = data.role
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete_user(db: Session, user_id: UUID, current_user_id: UUID) -> None:
        if user_id == current_user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不能删除自己",
            )
        user = UserService.get_user(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在",
            )
        db.delete(user)
        db.commit()
