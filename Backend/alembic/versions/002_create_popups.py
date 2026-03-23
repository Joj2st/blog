"""create popups table

Revision ID: 002
Revises: 001
Create Date: 2026-03-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '002'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'popups',
        sa.Column('id', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('title', sa.String(length=100), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('type', sa.Enum('notification', 'advertisement', name='popuptype'), nullable=False),
        sa.Column('status', sa.Enum('active', 'inactive', 'expired', name='popupstatus'), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('link_url', sa.String(length=500), nullable=True),
        sa.Column('start_time', sa.DateTime(), nullable=True),
        sa.Column('end_time', sa.DateTime(), nullable=True),
        sa.Column('show_frequency', sa.Enum('once', 'daily', 'always', name='showfrequency'), nullable=False),
        sa.Column('max_show_count', sa.Integer(), nullable=True),
        sa.Column('current_show_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('max_click_count', sa.Integer(), nullable=True),
        sa.Column('current_click_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_popups_id'), 'popups', ['id'], unique=False)
    op.create_index(op.f('ix_popups_type'), 'popups', ['type'], unique=False)
    op.create_index(op.f('ix_popups_status'), 'popups', ['status'], unique=False)
    op.create_index(op.f('ix_popups_start_time'), 'popups', ['start_time'], unique=False)
    op.create_index(op.f('ix_popups_end_time'), 'popups', ['end_time'], unique=False)
    op.create_index(op.f('ix_popups_created_at'), 'popups', ['created_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_popups_created_at'), table_name='popups')
    op.drop_index(op.f('ix_popups_end_time'), table_name='popups')
    op.drop_index(op.f('ix_popups_start_time'), table_name='popups')
    op.drop_index(op.f('ix_popups_status'), table_name='popups')
    op.drop_index(op.f('ix_popups_type'), table_name='popups')
    op.drop_index(op.f('ix_popups_id'), table_name='popups')
    op.drop_table('popups')
    op.execute('DROP TYPE IF EXISTS popuptype')
    op.execute('DROP TYPE IF EXISTS popupstatus')
    op.execute('DROP TYPE IF EXISTS showfrequency')
