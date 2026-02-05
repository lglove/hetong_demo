"""合同操作日志。"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class ContractOperationLog(Base):
    __tablename__ = "contract_operation_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contract_id = Column(UUID(as_uuid=True), ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    action = Column(String(32), nullable=False)  # create, submit, approve_finance, reject_finance, approve_admin, reject_admin, edit
    from_status = Column(String(32), nullable=True)
    to_status = Column(String(32), nullable=True)
    remark = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="operation_logs")
    user = relationship("User", lazy="joined")
