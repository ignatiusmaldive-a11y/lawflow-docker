"""Add timestamps, soft delete, and indexes to all models

Revision ID: fc73fd318893
Revises: 76aef5410a73
Create Date: 2025-12-16 22:47:29.260266

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fc73fd318893'
down_revision: Union[str, Sequence[str], None] = '76aef5410a73'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Add timestamps to clients
    op.add_column('clients', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('clients', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.execute("UPDATE clients SET created_at = datetime('now'), updated_at = datetime('now')")

    # Add timestamps, soft delete to projects
    op.add_column('projects', sa.Column('is_deleted', sa.Boolean(), nullable=True))
    op.add_column('projects', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('projects', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.execute("UPDATE projects SET is_deleted = 0, created_at = datetime('now'), updated_at = datetime('now')")
    op.create_index('ix_projects_status', 'projects', ['status'])
    op.create_index('ix_projects_created_at', 'projects', ['created_at'])
    op.create_index('ix_projects_updated_at', 'projects', ['updated_at'])

    # Add timestamps, soft delete to tasks
    op.add_column('tasks', sa.Column('is_deleted', sa.Boolean(), nullable=True))
    op.add_column('tasks', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('tasks', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.execute("UPDATE tasks SET is_deleted = 0, created_at = datetime('now'), updated_at = datetime('now')")
    op.create_index('ix_tasks_project_id', 'tasks', ['project_id'])
    op.create_index('ix_tasks_due_date', 'tasks', ['due_date'])
    op.create_index('ix_tasks_status', 'tasks', ['status'])
    op.create_index('ix_tasks_created_at', 'tasks', ['created_at'])
    op.create_index('ix_tasks_updated_at', 'tasks', ['updated_at'])

    # Add timestamps, soft delete to checklist_items
    op.add_column('checklist_items', sa.Column('is_deleted', sa.Boolean(), nullable=True))
    op.add_column('checklist_items', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('checklist_items', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.execute("UPDATE checklist_items SET is_deleted = 0, created_at = datetime('now'), updated_at = datetime('now')")
    op.create_index('ix_checklist_items_project_id', 'checklist_items', ['project_id'])
    op.create_index('ix_checklist_items_due_date', 'checklist_items', ['due_date'])
    op.create_index('ix_checklist_items_created_at', 'checklist_items', ['created_at'])
    op.create_index('ix_checklist_items_updated_at', 'checklist_items', ['updated_at'])

    # Add timestamps, soft delete to timeline_items
    op.add_column('timeline_items', sa.Column('is_deleted', sa.Boolean(), nullable=True))
    op.add_column('timeline_items', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('timeline_items', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.execute("UPDATE timeline_items SET is_deleted = 0, created_at = datetime('now'), updated_at = datetime('now')")
    op.create_index('ix_timeline_items_project_id', 'timeline_items', ['project_id'])
    op.create_index('ix_timeline_items_created_at', 'timeline_items', ['created_at'])
    op.create_index('ix_timeline_items_updated_at', 'timeline_items', ['updated_at'])

    # Add timestamps, soft delete to activities
    op.add_column('activities', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.add_column('activities', sa.Column('is_deleted', sa.Boolean(), nullable=True))
    op.execute("UPDATE activities SET updated_at = datetime('now'), is_deleted = 0")
    op.create_index('ix_activities_project_id', 'activities', ['project_id'])
    op.create_index('ix_activities_created_at', 'activities', ['created_at'])

    # Add timestamps, soft delete to files
    op.add_column('files', sa.Column('is_deleted', sa.Boolean(), nullable=True))
    op.add_column('files', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('files', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.execute("UPDATE files SET is_deleted = 0, created_at = datetime('now'), updated_at = datetime('now')")
    op.create_index('ix_files_project_id', 'files', ['project_id'])
    op.create_index('ix_files_created_at', 'files', ['created_at'])
    op.create_index('ix_files_updated_at', 'files', ['updated_at'])


def downgrade() -> None:
    """Downgrade schema."""
    # Drop indexes and columns from files
    op.drop_index('ix_files_updated_at', 'files')
    op.drop_index('ix_files_created_at', 'files')
    op.drop_index('ix_files_project_id', 'files')
    op.drop_column('files', 'updated_at')
    op.drop_column('files', 'created_at')
    op.drop_column('files', 'is_deleted')

    # Drop indexes and columns from activities
    op.drop_index('ix_activities_created_at', 'activities')
    op.drop_index('ix_activities_project_id', 'activities')
    op.drop_column('activities', 'is_deleted')
    op.drop_column('activities', 'updated_at')

    # Drop indexes and columns from timeline_items
    op.drop_index('ix_timeline_items_updated_at', 'timeline_items')
    op.drop_index('ix_timeline_items_created_at', 'timeline_items')
    op.drop_index('ix_timeline_items_project_id', 'timeline_items')
    op.drop_column('timeline_items', 'updated_at')
    op.drop_column('timeline_items', 'created_at')
    op.drop_column('timeline_items', 'is_deleted')

    # Drop indexes and columns from checklist_items
    op.drop_index('ix_checklist_items_updated_at', 'checklist_items')
    op.drop_index('ix_checklist_items_created_at', 'checklist_items')
    op.drop_index('ix_checklist_items_due_date', 'checklist_items')
    op.drop_index('ix_checklist_items_project_id', 'checklist_items')
    op.drop_column('checklist_items', 'updated_at')
    op.drop_column('checklist_items', 'created_at')
    op.drop_column('checklist_items', 'is_deleted')

    # Drop indexes and columns from tasks
    op.drop_index('ix_tasks_updated_at', 'tasks')
    op.drop_index('ix_tasks_created_at', 'tasks')
    op.drop_index('ix_tasks_status', 'tasks')
    op.drop_index('ix_tasks_due_date', 'tasks')
    op.drop_index('ix_tasks_project_id', 'tasks')
    op.drop_column('tasks', 'updated_at')
    op.drop_column('tasks', 'created_at')
    op.drop_column('tasks', 'is_deleted')

    # Drop indexes and columns from projects
    op.drop_index('ix_projects_updated_at', 'projects')
    op.drop_index('ix_projects_created_at', 'projects')
    op.drop_index('ix_projects_status', 'projects')
    op.drop_column('projects', 'updated_at')
    op.drop_column('projects', 'created_at')
    op.drop_column('projects', 'is_deleted')

    # Drop columns from clients
    op.drop_column('clients', 'updated_at')
    op.drop_column('clients', 'created_at')