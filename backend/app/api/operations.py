"""全局操作日志（仅超级管理员）。"""
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.operation_log import OperationLogResponse
from app.services.auth import get_current_user, require_super_admin
from app.services.contract import ContractService

router = APIRouter(prefix="/operations", tags=["operations"])


@router.get("", response_model=dict)
def list_operations_global(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    contract_id: UUID | None = None,
    user_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_super_admin),
):
    total, items = ContractService.list_operation_logs_global(
        db, current_user, contract_id=contract_id, user_id=user_id, skip=skip, limit=limit
    )
    return {
        "total": total,
        "items": [
            {
                "id": log.id,
                "contract_id": log.contract_id,
                "contract_no": log.contract.contract_no if log.contract else "",
                "user_id": log.user_id,
                "username": log.user.username if log.user else "",
                "action": log.action,
                "from_status": log.from_status,
                "to_status": log.to_status,
                "remark": log.remark,
                "created_at": log.created_at,
            }
            for log in items
        ],
    }
