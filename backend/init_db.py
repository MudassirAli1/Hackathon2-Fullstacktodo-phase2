"""
Database initialization script
Creates all tables defined in SQLModel models
"""
from sqlmodel import SQLModel
from src.database.database import engine
from src.models.task import Task
from src.models.auth import User

def init_db():
    """Initialize database by creating all tables"""
    print("Creating database tables...")
    SQLModel.metadata.create_all(engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init_db()
