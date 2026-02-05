"""本地磁盘存储。"""
from pathlib import Path
from typing import BinaryIO
from app.config import settings
from app.storage.base import Storage


class LocalStorage(Storage):
    def __init__(self, base_dir: str | None = None):
        self.base_dir = Path(base_dir or settings.upload_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _full_path(self, key: str) -> Path:
        return self.base_dir / key.replace("..", "").lstrip("/")

    def save(self, key: str, content: BinaryIO, size: int) -> str:
        path = self._full_path(key)
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            f.write(content.read(size))
        return key

    def get_path(self, key: str) -> str:
        return str(self._full_path(key).resolve())

    def read(self, key: str) -> bytes:
        path = self._full_path(key)
        if not path.exists():
            raise FileNotFoundError(key)
        return path.read_bytes()

    def delete(self, key: str) -> None:
        path = self._full_path(key)
        if path.exists():
            path.unlink()
