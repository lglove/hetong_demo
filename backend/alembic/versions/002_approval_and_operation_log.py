"""approval flow and operation log

Revision ID: 002
Revises: 001
Create Date: 2025-02-05

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE contractstatus ADD VALUE IF NOT EXISTS 'pending_finance'")
    op.execute("ALTER TYPE contractstatus ADD VALUE IF NOT EXISTS 'finance_approved'")
    op.execute("ALTER TYPE contractstatus ADD VALUE IF NOT EXISTS 'rejected'")

    op.create_table(
        "contract_operation_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("contract_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("action", sa.String(32), nullable=False),
        sa.Column("from_status", sa.String(32), nullable=True),
        sa.Column("to_status", sa.String(32), nullable=True),
        sa.Column("remark", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["contract_id"], ["contracts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_contract_operation_logs_contract_id", "contract_operation_logs", ["contract_id"])
    op.create_index("ix_contract_operation_logs_user_id", "contract_operation_logs", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_contract_operation_logs_user_id", table_name="contract_operation_logs")
    op.drop_index("ix_contract_operation_logs_contract_id", table_name="contract_operation_logs")
    op.drop_table("contract_operation_logs")
    # PostgreSQL enum values cannot be removed easily; leave new values in contractstatus