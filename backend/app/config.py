"""应用配置，从环境变量读取。"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """配置项。"""

    # 数据库
    database_url: str = "postgresql://postgres:postgres@localhost:5432/hetong"

    # JWT
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24  # 1 天

    # 上传目录（本地存储根目录）
    upload_dir: str = "uploads"

    # 日志目录（应用日志文件所在目录）
    log_dir: str = "logs"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
