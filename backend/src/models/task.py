from sqlmodel import SQLModel, Field, Column, DateTime
from datetime import datetime
from typing import Optional
from enum import Enum
import uuid

# Pydantic models for API requests/responses
class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)


class TaskCreateRequest(SQLModel):
    """Model for task creation API requests (no user_id required)"""
    title: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: bool = Field(default=False)


class TaskCreate(TaskBase):
    """Model for task creation in service layer (includes user_id)"""
    user_id: int


class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    completed: Optional[bool] = Field(default=None)


class TaskResponse(TaskBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

    def dict(self, **kwargs):
        """Override dict to convert ids to strings for API responses"""
        d = super().dict(**kwargs)
        d['id'] = str(d['id'])
        d['userId'] = str(d.pop('user_id'))  # Convert to camelCase for frontend
        return d


# Database model
class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))
    updated_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime(timezone=True)))

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if 'created_at' not in kwargs or kwargs['created_at'] is None:
            self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()