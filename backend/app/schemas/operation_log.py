from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class ApproveRejectRequest(BaseModel):
    remark: str | None = None


class OperationLogResponse(BaseModel):
    id: UUID
    contract_id: UUID
    user_id: UUID
    username: str = ""
    action: str
    from_status: str | None
    to_status: str | None
    remark: str | None
    created_at: datetime

    class Config:
        from_attributes = True
