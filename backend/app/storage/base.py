"""文件存储抽象，便于后续接入 OSS。"""
from abc import ABC, abstractmethod
from typing import BinaryIO


class Storage(ABC):
    @abstractmethod
    def save(self, key: str, content: BinaryIO, size: int) -> str:
        """保存文件，返回存储路径或 URL（用于数据库存 file_path）。"""
        pass

    @abstractmethod
    def get_path(self, key: str) -> str:
        """返回本地路径或可下载 URL。本地实现返回绝对路径。"""
        pass

    @abstractmethod
    def read(self, key: str) -> bytes:
        """读取文件内容（用于下载响应）。"""
        pass

    @abstractmethod
    def delete(self, key: str) -> None:
        """删除文件。"""
        pass
