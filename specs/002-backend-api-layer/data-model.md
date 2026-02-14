# Data Model: Backend & API Layer

**Feature**: Backend & API Layer
**Date**: 2026-02-05
**Status**: Draft

## Overview

This document describes the data model for the backend API layer of the todo application. It outlines the database entities, their properties, relationships, and validation rules that the backend will implement using SQLModel ORM.

## Entities

### Task

**Description**: Represents a user's personal todo item managed through the API

**Fields**:
- id: UUID or Integer (Primary Key) - Unique identifier for the task
- user_id: UUID or Integer (Foreign Key) - Reference to the owning user
- title: String (Required, 1-255 chars) - Task title/description
- description: String (Optional, max 1000 chars) - Extended task details
- completed: Boolean - Completion status (default: false)
- created_at: DateTime (Auto-generated) - Task creation timestamp
- updated_at: DateTime (Auto-generated) - Last modification timestamp

**Relationships**:
- Many-to-One with User (via user_id foreign key)
- Each task belongs to exactly one user
- A user can have multiple tasks

**Validation**:
- title must be 1-255 characters
- user_id must reference a valid user
- created_at and updated_at are automatically managed by the database
- completed defaults to False

### User (Referenced)

**Description**: Represents an authenticated user with unique identity

**Fields**:
- id: UUID or Integer (Primary Key) - Unique identifier for the user (managed by Better Auth)
- created_at: DateTime - Account creation timestamp
- updated_at: DateTime - Last modification timestamp

**Note**: The User entity is primarily managed by Better Auth system, but the API will reference user IDs from JWT tokens to enforce ownership.

**Relationships**:
- One-to-Many with Task (via task.user_id foreign key)
- Each user can own multiple tasks
- Each task belongs to exactly one user

## State Transitions

### Task State Transitions
- Pending (completed=False) → Completed (completed=True) when user marks task as complete
- Completed (completed=True) → Pending (completed=False) when user unmarks task as complete

## Constraints

### Data Integrity
- Referential integrity: user_id in Task table must reference valid User
- Non-null constraints: title, user_id, completed cannot be null
- Text length constraints: title must be between 1-255 characters

### Security Constraints
- Row-level security: Each user can only access tasks with matching user_id
- User ID validation: API enforces that user_id in JWT token matches the task's user_id
- No direct user table access: User data is validated through JWT token contents

## Validation Rules from Requirements

1. **FR-003 & FR-012**: Users can only access and modify their own tasks based on user ID in JWT token
2. **FR-004**: Task data must be persisted in Neon Serverless PostgreSQL database
3. **FR-007**: Input validation required for task creation and updates
4. **FR-009**: Task must support required fields: id, user_id, title, description, completed, timestamps
5. **FR-010**: Must use SQLModel ORM for database operations
6. **FR-011**: Proper database connection management required

## API-Specific Data Structures

### TaskCreate
- title: String (Required) - Task title
- description: String (Optional) - Task description
- completed: Boolean (Optional, default: false) - Initial completion status
- user_id: UUID or Integer (Auto-populated from JWT) - Associated user

### TaskUpdate
- title: String (Optional) - Updated task title
- description: String (Optional) - Updated task description
- completed: Boolean (Optional) - Updated completion status

### TaskResponse
- id: UUID or Integer - Unique task identifier
- user_id: UUID or Integer - Associated user identifier
- title: String - Task title
- description: String - Task description
- completed: Boolean - Completion status
- created_at: DateTime - Creation timestamp
- updated_at: DateTime - Last update timestamp

## Database Schema

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_completed ON tasks(completed);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
```

**Note**: The users table is managed by Better Auth, so foreign key constraints would be logical only, not enforced at the database level to avoid circular dependencies.