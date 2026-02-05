"""合同模型。"""
import enum
import uuid
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import Column, String, Enum, DateTime, Date, Numeric, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class ContractStatus(str, enum.Enum):
    draft = "draft"                     # 草稿
    pending_finance = "pending_finance"  # 待财务审批
    finance_approved = "finance_approved"  # 财务已审批，待管理员审批
    active = "active"                    # 已生效
    rejected = "rejected"                # 已驳回
    expired = "expired"                  # 已到期
    terminated = "terminated"            # 已终止


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(256), nullable=False)
    contract_no = Column(String(64), nullable=False, index=True)
    party_a = Column(String(256), nullable=False)
    party_b = Column(String(256), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    sign_date = Column(Date, nullable=True)
    expire_date = Column(Date, nullable=True)
    status = Column(Enum(ContractStatus), nullable=False, default=ContractStatus.draft)
    note = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    attachments = relationship("ContractAttachment", back_populates="contract", cascade="all, delete-orphan")
    operation_logs = relationship("ContractOperationLog", back_populates="contract", cascade="all, delete-orphan")
