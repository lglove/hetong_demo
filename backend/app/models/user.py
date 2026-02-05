"""用户模型。"""
import enum
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class UserRole(str, enum.Enum):
    super_admin = "super_admin"
    finance = "finance"
    normal = "normal"


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(64), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.normal)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
