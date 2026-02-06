"""合同 CRUD、审批流与操作日志。"""
from uuid import UUID
from datetime import date
from decimal import Decimal
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.contract import Contract, ContractStatus
from app.models.operation_log import ContractOperationLog
from app.schemas.contract import ContractCreate, ContractUpdate


def _log(db: Session, contract_id: UUID, user_id: UUID, action: str, from_status: str | None = None, to_status: str | None = None, remark: str | None = None) -> None:
    log = ContractOperationLog(
        contract_id=contract_id,
        user_id=user_id,
        action=action,
        from_status=from_status,
        to_status=to_status,
        remark=remark,
    )
    db.add(log)


class ContractService:
    @staticmethod
    def _can_manage_contract(user: User, contract: Contract) -> bool:
        if user.role == UserRole.super_admin:
            return True
        if user.role == UserRole.finance:
            return False
        return str(contract.created_by) == str(user.id)

    @staticmethod
    def _can_edit_contract(user: User, contract: Contract) -> bool:
        if user.role == UserRole.super_admin:
            return True
        if user.role == UserRole.finance:
            return False
        if str(contract.created_by) != str(user.id):
            return False
        return contract.status in (ContractStatus.draft, ContractStatus.rejected)

    @staticmethod
    def _can_view_contract(user: User, contract: Contract) -> bool:
        if user.role == UserRole.super_admin:
            return True
        if user.role == UserRole.finance:
            return True  # 财务可查看全部
        return str(contract.created_by) == str(user.id)

    @staticmethod
    def _list_filter(user: User):
        if user.role == UserRole.super_admin or user.role == UserRole.finance:
            return None  # 无过滤
        return Contract.created_by == user.id

    @staticmethod
    def list_contracts(
        db: Session,
        user: User,
        skip: int = 0,
        limit: int = 20,
        keyword: str | None = None,
        status_filter: ContractStatus | None = None,
        sign_date_from: date | None = None,
        sign_date_to: date | None = None,
    ):
        q = db.query(Contract).options(joinedload(Contract.creator))
        f = ContractService._list_filter(user)
        if f is not None:
            q = q.filter(f)
        if keyword:
            q = q.filter(
                or_(
                    Contract.title.ilike(f"%{keyword}%"),
                    Contract.contract_no.ilike(f"%{keyword}%"),
                    Contract.party_a.ilike(f"%{keyword}%"),
                    Contract.party_b.ilike(f"%{keyword}%"),
                )
            )
        if status_filter is not None:
            q = q.filter(Contract.status == status_filter)
        if sign_date_from is not None:
            q = q.filter(Contract.sign_date >= sign_date_from)
        if sign_date_to is not None:
            q = q.filter(Contract.sign_date <= sign_date_to)
        total = q.count()
        items = q.order_by(Contract.updated_at.desc()).offset(skip).limit(limit).all()
        return total, items

    @staticmethod
    def get_contract(db: Session, contract_id: UUID, user: User) -> Contract:
        contract = (
            db.query(Contract)
            .options(joinedload(Contract.creator))
            .filter(Contract.id == contract_id)
            .first()
        )
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="合同不存在",
            )
        if not ContractService._can_view_contract(user, contract):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权限查看该合同",
            )
        return contract

    @staticmethod
    def create_contract(db: Session, data: ContractCreate, user: User) -> Contract:
        if user.role == UserRole.finance:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="财务角色不能创建合同",
            )
        status_val = data.status if data.status in (ContractStatus.draft, ContractStatus.rejected) else ContractStatus.draft
        contract = Contract(
            title=data.title,
            contract_no=data.contract_no,
            party_a=data.party_a,
            party_b=data.party_b,
            amount=data.amount,
            sign_date=data.sign_date,
            expire_date=data.expire_date,
            status=status_val,
            note=data.note,
            created_by=user.id,
        )
        db.add(contract)
        db.commit()
        db.refresh(contract)
        _log(db, contract.id, user.id, "create", None, contract.status.value)
        db.commit()
        return contract

    @staticmethod
    def update_contract(
        db: Session, contract_id: UUID, data: ContractUpdate, user: User
    ) -> Contract:
        contract = ContractService.get_contract(db, contract_id, user)
        if not ContractService._can_edit_contract(user, contract):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权限修改该合同（仅草稿/已驳回可编辑）",
            )
        from_status = contract.status.value
        update = data.model_dump(exclude_unset=True)
        for k, v in update.items():
            if k == "amount" and v is not None:
                setattr(contract, k, Decimal(str(v)))
            else:
                setattr(contract, k, v)
        db.commit()
        db.refresh(contract)
        _log(db, contract.id, user.id, "edit", from_status, contract.status.value)
        db.commit()
        return contract

    @staticmethod
    def delete_contract(db: Session, contract_id: UUID, user: User) -> None:
        contract = ContractService.get_contract(db, contract_id, user)
        if not ContractService._can_manage_contract(user, contract):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="无权限删除该合同",
            )
        if user.role != UserRole.super_admin and contract.status not in (ContractStatus.draft, ContractStatus.rejected):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="仅草稿或已驳回的合同可删除",
            )
        db.delete(contract)
        db.commit()

    @staticmethod
    def submit_contract(db: Session, contract_id: UUID, user: User) -> Contract:
        contract = ContractService.get_contract(db, contract_id, user)
        if str(contract.created_by) != str(user.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="仅创建人可提交")
        if contract.status != ContractStatus.draft:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="仅草稿可提交审批")
        from_status = contract.status.value
        contract.status = ContractStatus.pending_finance
        db.commit()
        db.refresh(contract)
        _log(db, contract.id, user.id, "submit", from_status, contract.status.value)
        db.commit()
        return contract

    @staticmethod
    def finance_approve(db: Session, contract_id: UUID, user: User, remark: str | None = None) -> Contract:
        if user.role != UserRole.finance and user.role != UserRole.super_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="仅财务可审批")
        contract = ContractService.get_contract(db, contract_id, user)
        if contract.status != ContractStatus.pending_finance:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="当前状态不允许财务审批")
        from_status = contract.status.value
        contract.status = ContractStatus.finance_approved
        db.commit()
        db.refresh(contract)
        _log(db, contract.id, user.id, "approve_finance", from_status, contract.status.value, remark)
        db.commit()
        return contract

    @staticmethod
    def finance_reject(db: Session, contract_id: UUID, user: User, remark: str | None = None) -> Contract:
        if user.role != UserRole.finance and user.role != UserRole.super_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="仅财务可驳回")
        contract = ContractService.get_contract(db, contract_id, user)
        if contract.status != ContractStatus.pending_finance:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="当前状态不允许财务驳回")
        from_status = contract.status.value
        contract.status = ContractStatus.rejected
        db.commit()
        db.refresh(contract)
        _log(db, contract.id, user.id, "reject_finance", from_status, contract.status.value, remark)
        db.commit()
        return contract

    @staticmethod
    def admin_approve(db: Session, contract_id: UUID, user: User, remark: str | None = None) -> Contract:
        if user.role != UserRole.super_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="仅超级管理员可终审")
        contract = ContractService.get_contract(db, contract_id, user)
        if contract.status != ContractStatus.finance_approved:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="当前状态不允许管理员审批")
        from_status = contract.status.value
        contract.status = ContractStatus.active
        db.commit()
        db.refresh(contract)
        _log(db, contract.id, user.id, "approve_admin", from_status, contract.status.value, remark)
        db.commit()
        return contract

    @staticmethod
    def admin_reject(db: Session, contract_id: UUID, user: User, remark: str | None = None) -> Contract:
        if user.role != UserRole.super_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="仅超级管理员可终审驳回")
        contract = ContractService.get_contract(db, contract_id, user)
        if contract.status != ContractStatus.finance_approved:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="当前状态不允许管理员驳回")
        from_status = contract.status.value
        contract.status = ContractStatus.rejected
        db.commit()
        db.refresh(contract)
        _log(db, contract.id, user.id, "reject_admin", from_status, contract.status.value, remark)
        db.commit()
        return contract

    @staticmethod
    def withdraw_by_creator(db: Session, contract_id: UUID, user: User) -> Contract:
        contract = ContractService.get_contract(db, contract_id, user)
        if str(contract.created_by) != str(user.id):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="仅创建人可撤回")
        if contract.status != ContractStatus.pending_finance:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="仅待财务审批状态可撤回")
        from_status = contract.status.value
        contract.status = ContractStatus.draft
        db.commit()
        db.refresh(contract)
        _log(db, contract.id, user.id, "withdraw_creator", from_status, contract.status.value)
        db.commit()
        return contract

    @staticmethod
    def withdraw_by_finance(db: Session, contract_id: UUID, user: User) -> Contract:
        if user.role != UserRole.finance and user.role != UserRole.super_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="仅财务可撤回")
        contract = ContractService.get_contract(db, contract_id, user)
        if contract.status != ContractStatus.finance_approved:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="仅待管理员审批状态可撤回")
        from_status = contract.status.value
        contract.status = ContractStatus.pending_finance
        db.commit()
        db.refresh(contract)
        _log(db, contract.id, user.id, "withdraw_finance", from_status, contract.status.value)
        db.commit()
        return contract

    @staticmethod
    def list_operation_logs_for_contract(db: Session, contract_id: UUID, user: User):
        contract = ContractService.get_contract(db, contract_id, user)
        logs = (
            db.query(ContractOperationLog)
            .options(joinedload(ContractOperationLog.user))
            .filter(ContractOperationLog.contract_id == contract_id)
            .order_by(ContractOperationLog.created_at.asc())
            .all()
        )
        return contract, logs

    @staticmethod
    def list_operation_logs_global(
        db: Session, user: User, contract_id: UUID | None = None, user_id: UUID | None = None, skip: int = 0, limit: int = 50
    ):
        if user.role != UserRole.super_admin:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="仅超级管理员可查看全局操作日志")
        q = (
            db.query(ContractOperationLog, Contract.contract_no)
            .join(Contract, ContractOperationLog.contract_id == Contract.id)
            .options(joinedload(ContractOperationLog.user))
        )
        if contract_id is not None:
            q = q.filter(ContractOperationLog.contract_id == contract_id)
        if user_id is not None:
            q = q.filter(ContractOperationLog.user_id == user_id)
        base_filter = db.query(ContractOperationLog).join(Contract, ContractOperationLog.contract_id == Contract.id)
        if contract_id is not None:
            base_filter = base_filter.filter(ContractOperationLog.contract_id == contract_id)
        if user_id is not None:
            base_filter = base_filter.filter(ContractOperationLog.user_id == user_id)
        total = base_filter.count()
        rows = q.order_by(ContractOperationLog.created_at.desc()).offset(skip).limit(limit).all()
        # 返回 (log, contract_no) 列表，供 API 层组装
        items = [(row[0], row[1]) for row in rows]
        return total, items
