from sqlmodel import create_engine, Session
from ..config.settings import settings

# Create the database engine
engine = create_engine(settings.DATABASE_URL, echo=(settings.ENVIRONMENT == "development"))


def get_session():
    """Generator to yield database session"""
    with Session(engine) as session:
        yield session