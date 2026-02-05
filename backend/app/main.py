import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, users, contracts, attachments, operations
from app.config import settings
from app.database import get_db

# 日志目录与文件
_log_dir = Path(settings.log_dir)
_log_dir.mkdir(parents=True, exist_ok=True)
_log_file = _log_dir / "app.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.FileHandler(_log_file, encoding="utf-8"),
        logging.StreamHandler(),
    ],
)
logger = logging.getLogger("app")
logger.info("日志文件: %s", _log_file.resolve())

app = FastAPI(title="合同管理系统 API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(contracts.router, prefix="/api")
app.include_router(attachments.router, prefix="/api")
app.include_router(operations.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "合同管理系统 API", "docs": "/docs"}
