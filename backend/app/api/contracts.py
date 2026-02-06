from uuid import UUID
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.contract import ContractStatus
from app.schemas.contract import (
    ContractCreate,
    ContractUpdate,
    ContractResponse,
    ContractListResponse,
)
from app.schemas.attachment import AttachmentResponse
from app.schemas.operation_log import ApproveRejectRequest, OperationLogResponse
from app.services.auth import get_current_user
from app.services.contract import ContractService

router = APIRouter(prefix="/contracts", tags=["contracts"])


def _contract_to_response(c) -> ContractResponse:
    return ContractResponse(
        id=str(c.id),
        title=c.title,
        contract_no=c.contract_no,
        party_a=c.party_a,
        party_b=c.party_b,
        amount=c.amount,
        sign_date=c.sign_date,
        expire_date=c.expire_date,
        status=c.status,
        note=c.note,
        created_by=str(c.created_by),
        created_at=c.created_at,
        updated_at=c.updated_at,
        attachments=[
            AttachmentResponse(
                id=str(a.id),
                contract_id=str(a.contract_id),
                file_name=a.file_name,
                file_size=a.file_size,
                created_at=a.created_at,
            )
            for a in c.attachments
        ],
    )


@router.get("", response_model=dict)
def list_contracts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=500),
    keyword: str | None = None,
    status_filter: ContractStatus | None = None,
    sign_date_from: date | None = None,
    sign_date_to: date | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total, items = ContractService.list_contracts(
        db, current_user, skip, limit, keyword, status_filter, sign_date_from, sign_date_to
    )
    return {
        "total": total,
        "items": [
            ContractListResponse(
                id=str(c.id),
                title=c.title,
                contract_no=c.contract_no,
                party_a=c.party_a,
                party_b=c.party_b,
                amount=c.amount,
                status=c.status,
                created_at=c.created_at,
            )
            for c in items
        ],
    }


@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(
    contract_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = ContractService.get_contract(db, contract_id, current_user)
    return _contract_to_response(contract)


@router.post("", response_model=ContractResponse, status_code=201)
def create_contract(
    data: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = ContractService.create_contract(db, data, current_user)
    return _contract_to_response(contract)


@router.put("/{contract_id}", response_model=ContractResponse)
def update_contract(
    contract_id: UUID,
    data: ContractUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = ContractService.update_contract(db, contract_id, data, current_user)
    return _contract_to_response(contract)


@router.delete("/{contract_id}", status_code=204)
def delete_contract(
    contract_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ContractService.delete_contract(db, contract_id, current_user)


@router.post("/{contract_id}/submit", response_model=ContractResponse)
def submit_contract(
    contract_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = ContractService.submit_contract(db, contract_id, current_user)
    return _contract_to_response(contract)


@router.post("/{contract_id}/withdraw-by-creator", response_model=ContractResponse)
def withdraw_by_creator(
    contract_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = ContractService.withdraw_by_creator(db, contract_id, current_user)
    return _contract_to_response(contract)


@router.post("/{contract_id}/withdraw-by-finance", response_model=ContractResponse)
def withdraw_by_finance(
    contract_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = ContractService.withdraw_by_finance(db, contract_id, current_user)
    return _contract_to_response(contract)


@router.post("/{contract_id}/approve-finance", response_model=ContractResponse)
def finance_approve(
    contract_id: UUID,
    body: ApproveRejectRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    remark = body.remark if body else None
    contract = ContractService.finance_approve(db, contract_id, current_user, remark)
    return _contract_to_response(contract)


@router.post("/{contract_id}/reject-finance", response_model=ContractResponse)
def finance_reject(
    contract_id: UUID,
    body: ApproveRejectRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    remark = body.remark if body else None
    contract = ContractService.finance_reject(db, contract_id, current_user, remark)
    return _contract_to_response(contract)


@router.post("/{contract_id}/approve-admin", response_model=ContractResponse)
def admin_approve(
    contract_id: UUID,
    body: ApproveRejectRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    remark = body.remark if body else None
    contract = ContractService.admin_approve(db, contract_id, current_user, remark)
    return _contract_to_response(contract)


@router.post("/{contract_id}/reject-admin", response_model=ContractResponse)
def admin_reject(
    contract_id: UUID,
    body: ApproveRejectRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    remark = body.remark if body else None
    contract = ContractService.admin_reject(db, contract_id, current_user, remark)
    return _contract_to_response(contract)


@router.get("/{contract_id}/operations", response_model=list[OperationLogResponse])
def list_contract_operations(
    contract_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logs = ContractService.list_operation_logs_for_contract(db, contract_id, current_user)
    return [
        OperationLogResponse(
            id=log.id,
            contract_id=log.contract_id,
            user_id=log.user_id,
            username=log.user.username if log.user else "",
            action=log.action,
            from_status=log.from_status,
            to_status=log.to_status,
            remark=log.remark,
            created_at=log.created_at,
        )
        for log in logs
    ]
