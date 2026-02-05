"""initial schema

Revision ID: 001
Revises:
Create Date: 2025-02-05

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE TYPE userrole AS ENUM ('super_admin', 'finance', 'normal')")
    op.execute(
        "CREATE TYPE contractstatus AS ENUM ('draft', 'active', 'expired', 'terminated')"
    )
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("username", sa.String(64), nullable=False),
        sa.Column("password_hash", sa.String(128), nullable=False),
        sa.Column("role", postgresql.ENUM("super_admin", "finance", "normal", name="userrole", create_type=False), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_username"), "users", ["username"], unique=True)

    op.create_table(
        "contracts",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(256), nullable=False),
        sa.Column("contract_no", sa.String(64), nullable=False),
        sa.Column("party_a", sa.String(256), nullable=False),
        sa.Column("party_b", sa.String(256), nullable=False),
        sa.Column("amount", sa.Numeric(18, 2), nullable=False),
        sa.Column("sign_date", sa.Date(), nullable=True),
        sa.Column("expire_date", sa.Date(), nullable=True),
        sa.Column("status", postgresql.ENUM("draft", "active", "expired", "terminated", name="contractstatus", create_type=False), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_contracts_contract_no"), "contracts", ["contract_no"], unique=False)

    op.create_table(
        "contract_attachments",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("contract_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("file_name", sa.String(256), nullable=False),
        sa.Column("file_path", sa.String(512), nullable=False),
        sa.Column("file_size", sa.BigInteger(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["contract_id"], ["contracts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("contract_attachments")
    op.drop_table("contracts")
    op.drop_index(op.f("ix_users_username"), table_name="users")
    op.drop_table("users")
    op.execute("DROP TYPE contractstatus")
    op.execute("DROP TYPE userrole")
