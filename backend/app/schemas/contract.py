from datetime import date, datetime
from decimal import Decimal
from uuid import UUID
from pydantic import BaseModel
from app.models.contract import ContractStatus
from app.schemas.attachment import AttachmentResponse


class ContractCreate(BaseModel):
    title: str
    contract_no: str
    party_a: str
    party_b: str
    amount: Decimal
    sign_date: date | None = None
    expire_date: date | None = None
    status: ContractStatus = ContractStatus.draft
    note: str | None = None


class ContractUpdate(BaseModel):
    title: str | None = None
    contract_no: str | None = None
    party_a: str | None = None
    party_b: str | None = None
    amount: Decimal | None = None
    sign_date: date | None = None
    expire_date: date | None = None
    status: ContractStatus | None = None
    note: str | None = None


class ContractResponse(BaseModel):
    id: UUID
    title: str
    contract_no: str
    party_a: str
    party_b: str
    amount: Decimal
    sign_date: date | None
    expire_date: date | None
    status: ContractStatus
    note: str | None
    created_by: UUID
    created_by_username: str = ""
    created_at: datetime
    updated_at: datetime
    attachments: list[AttachmentResponse] = []

    class Config:
        from_attributes = True


class ContractListResponse(BaseModel):
    id: UUID
    title: str
    contract_no: str
    party_a: str
    party_b: str
    amount: Decimal
    status: ContractStatus
    created_by_username: str = ""
    created_at: datetime

    class Config:
        from_attributes = True
