"""数据库连接与会话。"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from app.config import settings

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """依赖：获取 DB 会话。"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
