from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class AttachmentResponse(BaseModel):
    id: UUID
    contract_id: UUID
    file_name: str
    file_size: int
    created_at: datetime

    class Config:
        from_attributes = True
