from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlmodel import Session
from typing import List, Optional
from ..models.task import Task, TaskCreate, TaskCreateRequest, TaskUpdate
from ..services.task_service import TaskService
from .deps import get_current_user, get_db_session


class TaskCompletionToggle(BaseModel):
    completed: bool


router = APIRouter()


@router.get("/users/{user_id}/tasks", response_model=dict)
def get_all_tasks(
    user_id: int,
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of tasks to return"),
    offset: int = Query(0, ge=0, description="Number of tasks to skip"),
    current_user_data: dict = Depends(get_current_user),
    session: Session = Depends(get_db_session)
):
    """
    Get all tasks for a specific user
    """
    # Verify that the user_id in the URL matches the authenticated user's ID
    if str(current_user_data["user_id"]) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - you can only access your own tasks"
        )

    tasks = TaskService.get_all_tasks(session, user_id, completed)

    # Apply limit and offset
    start_idx = offset
    end_idx = start_idx + limit
    paginated_tasks = tasks[start_idx:end_idx]

    # Convert tasks to dict with proper formatting
    formatted_tasks = []
    for task in paginated_tasks:
        task_dict = {
            "id": str(task.id),
            "userId": str(task.user_id),
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "createdAt": task.created_at.isoformat() if task.created_at else None,
            "updatedAt": task.updated_at.isoformat() if task.updated_at else None,
        }
        formatted_tasks.append(task_dict)

    return {
        "success": True,
        "tasks": formatted_tasks,
        "total": len(tasks),
        "limit": limit,
        "offset": offset
    }


@router.post("/users/{user_id}/tasks", response_model=dict, status_code=status.HTTP_201_CREATED)
def create_task(
    user_id: int,
    task_request: TaskCreateRequest,
    current_user_data: dict = Depends(get_current_user),
    session: Session = Depends(get_db_session)
):
    """
    Create a new task for a user
    """
    # Verify that the user_id in the URL matches the authenticated user's ID
    if str(current_user_data["user_id"]) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - you can only create tasks for yourself"
        )

    # Create TaskCreate object with user_id from authenticated user
    task_create = TaskCreate(
        title=task_request.title,
        description=task_request.description,
        completed=task_request.completed,
        user_id=user_id
    )

    task = TaskService.create_task(session, task_create)

    # Format task response
    task_dict = {
        "id": str(task.id),
        "userId": str(task.user_id),
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "createdAt": task.created_at.isoformat() if task.created_at else None,
        "updatedAt": task.updated_at.isoformat() if task.updated_at else None,
    }

    return {
        "success": True,
        "task": task_dict
    }


@router.get("/users/{user_id}/tasks/{task_id}", response_model=dict)
def get_task_by_id(
    user_id: int,
    task_id: int,
    current_user_data: dict = Depends(get_current_user),
    session: Session = Depends(get_db_session)
):
    """
    Get a specific task by ID for a user
    """
    # Verify that the user_id in the URL matches the authenticated user's ID
    if str(current_user_data["user_id"]) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - you can only access your own tasks"
        )

    task = TaskService.get_task_by_id(session, user_id, task_id)

    # Format task response
    task_dict = {
        "id": str(task.id),
        "userId": str(task.user_id),
        "title": task.title,
        "description": task.description,
        "completed": task.completed,
        "createdAt": task.created_at.isoformat() if task.created_at else None,
        "updatedAt": task.updated_at.isoformat() if task.updated_at else None,
    }

    return {
        "success": True,
        "task": task_dict
    }


@router.put("/users/{user_id}/tasks/{task_id}", response_model=dict)
def update_task(
    user_id: int,
    task_id: int,
    task_update: TaskUpdate,
    current_user_data: dict = Depends(get_current_user),
    session: Session = Depends(get_db_session)
):
    """
    Update an existing task for a user
    """
    # Verify that the user_id in the URL matches the authenticated user's ID
    if str(current_user_data["user_id"]) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - you can only update your own tasks"
        )

    updated_task = TaskService.update_task(session, user_id, task_id, task_update)

    # Format task response
    task_dict = {
        "id": str(updated_task.id),
        "userId": str(updated_task.user_id),
        "title": updated_task.title,
        "description": updated_task.description,
        "completed": updated_task.completed,
        "createdAt": updated_task.created_at.isoformat() if updated_task.created_at else None,
        "updatedAt": updated_task.updated_at.isoformat() if updated_task.updated_at else None,
    }

    return {
        "success": True,
        "task": task_dict
    }


@router.delete("/users/{user_id}/tasks/{task_id}", response_model=dict)
def delete_task(
    user_id: int,
    task_id: int,
    current_user_data: dict = Depends(get_current_user),
    session: Session = Depends(get_db_session)
):
    """
    Delete a specific task for a user
    """
    # Verify that the user_id in the URL matches the authenticated user's ID
    if str(current_user_data["user_id"]) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - you can only delete your own tasks"
        )

    TaskService.delete_task(session, user_id, task_id)

    return {
        "success": True,
        "message": "Task deleted successfully"
    }


@router.patch("/users/{user_id}/tasks/{task_id}/complete", response_model=dict)
def toggle_task_completion(
    user_id: int,
    task_id: int,
    task_completion: TaskCompletionToggle,
    current_user_data: dict = Depends(get_current_user),
    session: Session = Depends(get_db_session)
):
    """
    Toggle the completion status of a task
    """
    # Verify that the user_id in the URL matches the authenticated user's ID
    if str(current_user_data["user_id"]) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied - you can only modify your own tasks"
        )

    completed = task_completion.completed

    if not isinstance(completed, bool):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="'completed' field must be a boolean value"
        )

    updated_task = TaskService.toggle_task_completion(session, user_id, task_id, completed)

    # Format task response
    task_dict = {
        "id": str(updated_task.id),
        "userId": str(updated_task.user_id),
        "title": updated_task.title,
        "description": updated_task.description,
        "completed": updated_task.completed,
        "createdAt": updated_task.created_at.isoformat() if updated_task.created_at else None,
        "updatedAt": updated_task.updated_at.isoformat() if updated_task.updated_at else None,
    }

    return {
        "success": True,
        "task": task_dict
    }