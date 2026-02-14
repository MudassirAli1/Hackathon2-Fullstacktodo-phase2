from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Authentication settings
    BETTER_AUTH_SECRET: str = "your_jwt_secret_key_here"  # Should be set via environment
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_DELTA: int = 2592000  # 30 days in seconds (for persistent login)

    # Database settings
    DATABASE_URL: str = "sqlite:///./todo_app.db"  # Default, should be overridden

    # Application settings
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    model_config = {"env_file": ".env", "case_sensitive": True}


# Create a singleton instance of settings
settings = Settings()