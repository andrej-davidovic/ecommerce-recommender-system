"""add_sr_translation_columns

Revision ID: c5b938da46f8
Revises: 2e8db478126f
Create Date: 2026-06-05 15:42:47.135194

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'c5b938da46f8'
down_revision: Union[str, Sequence[str], None] = '2e8db478126f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('categories', sa.Column('name_sr', sa.String(length=100), nullable=True))
    op.add_column('categories', sa.Column('description_sr', sa.Text(), nullable=True))
    op.add_column('products', sa.Column('name_sr', sa.String(length=255), nullable=True))
    op.add_column('products', sa.Column('description_sr', sa.Text(), nullable=True))

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('products', 'description_sr')
    op.drop_column('products', 'name_sr')
    op.drop_column('categories', 'description_sr')
    op.drop_column('categories', 'name_sr')
