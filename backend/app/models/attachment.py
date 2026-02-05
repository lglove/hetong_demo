"""合同附件模型。"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, BigInteger, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class ContractAttachment(Base):
    __tablename__ = "contract_attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contract_id = Column(UUID(as_uuid=True), ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False)
    file_name = Column(String(256), nullable=False)
    file_path = Column(String(512), nullable=False)  # 相对路径或 OSS key
    file_size = Column(BigInteger, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="attachments")
