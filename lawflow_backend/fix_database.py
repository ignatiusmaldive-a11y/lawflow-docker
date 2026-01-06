#!/usr/bin/env python3

"""
Script to fix the database by clearing existing data and allowing the seed script to run.
This will ensure the database has the expected 15 projects with all associated data.
"""

import os
import sys

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from app.db import engine, SessionLocal
from app.models import Base
from app.seed import seed_if_empty

def clear_database():
    """Clear all data from the database tables."""
    print("🧹 Clearing existing database data...")
    
    # Get all table names
    with engine.connect() as conn:
        # Get table names from SQLite master
        tables = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        table_names = [row[0] for row in tables if row[0] not in ['alembic_version', 'sqlite_sequence']]
        
        # Clear each table
        for table_name in table_names:
            print(f"  📋 Clearing table: {table_name}")
            conn.execute(text(f"DELETE FROM {table_name}"))
            # Reset autoincrement counters (if sqlite_sequence table exists)
            try:
                conn.execute(text(f"DELETE FROM sqlite_sequence WHERE name='{table_name}'"))
            except Exception:
                # sqlite_sequence table doesn't exist, which is fine
                pass
        
        conn.commit()
    
    print("✅ Database cleared successfully!")

def main():
    print("🔧 LawFlow Database Fix Script")
    print("=" * 50)
    
    # Clear existing data
    clear_database()
    
    # Create all tables
    print("🛠️  Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Run the seed function
    print("🌱 Running seed function to populate database...")
    db = SessionLocal()
    try:
        seed_if_empty(db)
        print("✅ Database seeded successfully!")
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        return 1
    finally:
        db.close()
    
    # Verify the results
    print("🔍 Verifying database contents...")
    db = SessionLocal()
    try:
        project_count = db.execute(text("SELECT COUNT(*) FROM projects")).scalar()
        checklist_count = db.execute(text("SELECT COUNT(*) FROM checklist_items")).scalar()
        task_count = db.execute(text("SELECT COUNT(*) FROM tasks")).scalar()
        
        print(f"📊 Projects: {project_count}")
        print(f"📋 Checklist Items: {checklist_count}")
        print(f"📝 Tasks: {task_count}")
        
        if project_count == 15:
            print("🎉 Database fix completed successfully! All 15 projects are now present.")
            return 0
        else:
            print(f"⚠️  Expected 15 projects but found {project_count}")
            return 1
    finally:
        db.close()

if __name__ == "__main__":
    sys.exit(main())