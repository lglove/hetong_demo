"""合同附件上传与下载。"""
import uuid
from urllib.parse import quote
from fastapi import APIRouter, Depends, UploadFile, File, status
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.contract import Contract
from app.models.attachment import ContractAttachment
from app.services.auth import get_current_user
from app.services.contract import ContractService
from app.storage import LocalStorage

router = APIRouter(tags=["attachments"])
storage = LocalStorage()


@router.post("/contracts/{contract_id}/attachments", status_code=status.HTTP_201_CREATED)
def upload_attachment(
    contract_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = ContractService.get_contract(db, contract_id, current_user)
    if not ContractService._can_manage_contract(current_user, contract):
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权限上传附件",
        )
    content = file.file.read()
    size = len(content)
    key = f"contracts/{contract_id}/{uuid.uuid4()}_{file.filename or 'file'}"
    from io import BytesIO
    storage.save(key, BytesIO(content), size)
    att = ContractAttachment(
        contract_id=contract_id,
        file_name=file.filename or "file",
        file_path=key,
        file_size=size,
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return {
        "id": str(att.id),
        "file_name": att.file_name,
        "file_size": att.file_size,
    }


@router.get("/contracts/{contract_id}/attachments/{attachment_id}")
def download_attachment(
    contract_id: uuid.UUID,
    attachment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    contract = ContractService.get_contract(db, contract_id, current_user)
    att = db.query(ContractAttachment).filter(
        ContractAttachment.id == attachment_id,
        ContractAttachment.contract_id == contract_id,
    ).first()
    if not att:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="附件不存在",
        )
    try:
        data = storage.read(att.file_path)
    except FileNotFoundError:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="文件不存在",
        )
    # HTTP 头仅支持 latin-1，中文用 RFC 5987 filename*=UTF-8'' 百分号编码（纯 ASCII）
    ascii_fallback = "download"
    if all(ord(c) < 128 for c in att.file_name):
        ascii_fallback = att.file_name
    encoded_name = quote(att.file_name, safe="")
    disposition = f"attachment; filename=\"{ascii_fallback}\"; filename*=UTF-8''{encoded_name}"
    return Response(
        content=data,
        media_type="application/octet-stream",
        headers={"Content-Disposition": disposition},
    )
