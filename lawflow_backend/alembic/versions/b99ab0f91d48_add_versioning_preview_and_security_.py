"""Add versioning, preview, and security fields to FileItem

Revision ID: b99ab0f91d48
Revises: fc73fd318893
Create Date: 2025-12-16 23:15:43.711312

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b99ab0f91d48'
down_revision: Union[str, Sequence[str], None] = 'fc73fd318893'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add versioning fields
    op.add_column('files', sa.Column('version', sa.Integer(), nullable=True))
    op.add_column('files', sa.Column('original_filename', sa.String(length=260), nullable=True))
    op.add_column('files', sa.Column('parent_version_id', sa.Integer(), nullable=True))

    # Add preview fields
    op.add_column('files', sa.Column('preview_path', sa.String(length=520), nullable=True))
    op.add_column('files', sa.Column('thumbnail_path', sa.String(length=520), nullable=True))
    op.add_column('files', sa.Column('file_size', sa.Integer(), nullable=True))

    # Add security fields
    op.add_column('files', sa.Column('scan_status', sa.String(length=50), nullable=True))
    op.add_column('files', sa.Column('scan_result', sa.Text(), nullable=True))

    # Update existing records with default values
    op.execute("UPDATE files SET version = 1 WHERE version IS NULL")
    op.execute("UPDATE files SET scan_status = 'pending' WHERE scan_status IS NULL")

    # Create index for version field
    op.create_index('ix_files_version', 'files', ['version'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop index
    op.drop_index('ix_files_version', 'files')

    # Drop added columns
    op.drop_column('files', 'scan_result')
    op.drop_column('files', 'scan_status')
    op.drop_column('files', 'file_size')
    op.drop_column('files', 'thumbnail_path')
    op.drop_column('files', 'preview_path')
    op.drop_column('files', 'parent_version_id')
    op.drop_column('files', 'original_filename')
    op.drop_column('files', 'version')