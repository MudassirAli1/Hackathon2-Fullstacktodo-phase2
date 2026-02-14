# API Contracts: Task Management API

**Feature**: Backend & API Layer
**Date**: 2026-02-05
**Status**: Draft

## Overview

This document defines the API contracts for the task management endpoints. These contracts are derived from the functional requirements and specify the expected API endpoints, request/response formats, authentication requirements, and error handling.

## Base URL
```
https://api.todoapp.com/api/v1  # or http://localhost:8000/api/v1 for development
```

## Authentication

All endpoints require JWT token in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

The JWT token contains user information and must be verified on each request. The user ID in the JWT token will be validated against the user_id in the request path.

## API Endpoints

### 1. Get All Tasks for User
**Endpoint**: `GET /users/{user_id}/tasks`

**Description**: Retrieve all tasks for a specific user

**Parameters**:
- `user_id` (path): The ID of the user whose tasks to retrieve
- `completed` (query, optional): Filter by completion status (true/false/all)
- `limit` (query, optional): Maximum number of tasks to return (default: 50)
- `offset` (query, optional): Number of tasks to skip (default: 0)

**Headers**:
- `Authorization`: Bearer {jwt_token}

**Request Body**: None

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": 1,
      "user_id": 123,
      "title": "Complete project proposal",
      "description": "Finish and submit the project proposal by Friday",
      "completed": false,
      "created_at": "2026-02-05T10:30:00Z",
      "updated_at": "2026-02-05T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User ID in JWT doesn't match user_id in path
- `404 Not Found`: User ID doesn't exist
- `500 Internal Server Error`: Server error processing request

---

### 2. Create New Task
**Endpoint**: `POST /users/{user_id}/tasks`

**Description**: Create a new task for a user

**Parameters**:
- `user_id` (path): The ID of the user creating the task

**Headers**:
- `Authorization`: Bearer {jwt_token}

**Request Body**:
```json
{
  "title": "New task title",
  "description": "Detailed task description (optional)",
  "completed": false
}
```

**Successful Response (201 Created)**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "user_id": 123,
    "title": "New task title",
    "description": "Detailed task description (optional)",
    "completed": false,
    "created_at": "2026-02-05T11:00:00Z",
    "updated_at": "2026-02-05T11:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body or missing required fields
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User ID in JWT doesn't match user_id in path
- `422 Unprocessable Entity`: Validation errors (e.g., title too long)
- `500 Internal Server Error`: Server error processing request

---

### 3. Get Task by ID
**Endpoint**: `GET /users/{user_id}/tasks/{task_id}`

**Description**: Retrieve a specific task for a user

**Parameters**:
- `user_id` (path): The ID of the user
- `task_id` (path): The ID of the task to retrieve

**Headers**:
- `Authorization`: Bearer {jwt_token}

**Request Body**: None

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "user_id": 123,
    "title": "Complete project proposal",
    "description": "Finish and submit the project proposal by Friday",
    "completed": false,
    "created_at": "2026-02-05T10:30:00Z",
    "updated_at": "2026-02-05T10:30:00Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User ID in JWT doesn't match user_id in path
- `404 Not Found`: Task doesn't exist or doesn't belong to the user
- `500 Internal Server Error`: Server error processing request

---

### 4. Update Task
**Endpoint**: `PUT /users/{user_id}/tasks/{task_id}`

**Description**: Update an existing task for a user

**Parameters**:
- `user_id` (path): The ID of the user
- `task_id` (path): The ID of the task to update

**Headers**:
- `Authorization`: Bearer {jwt_token}

**Request Body**:
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "completed": true
}
```

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "user_id": 123,
    "title": "Updated task title",
    "description": "Updated description",
    "completed": true,
    "created_at": "2026-02-05T10:30:00Z",
    "updated_at": "2026-02-05T12:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User ID in JWT doesn't match user_id in path
- `404 Not Found`: Task doesn't exist or doesn't belong to the user
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error processing request

---

### 5. Delete Task
**Endpoint**: `DELETE /users/{user_id}/tasks/{task_id}`

**Description**: Delete a specific task for a user

**Parameters**:
- `user_id` (path): The ID of the user
- `task_id` (path): The ID of the task to delete

**Headers**:
- `Authorization`: Bearer {jwt_token}

**Request Body**: None

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User ID in JWT doesn't match user_id in path
- `404 Not Found`: Task doesn't exist or doesn't belong to the user
- `500 Internal Server Error`: Server error processing request

---

### 6. Toggle Task Completion
**Endpoint**: `PATCH /users/{user_id}/tasks/{task_id}/complete`

**Description**: Toggle the completion status of a task

**Parameters**:
- `user_id` (path): The ID of the user
- `task_id` (path): The ID of the task to update

**Headers**:
- `Authorization`: Bearer {jwt_token}

**Request Body**:
```json
{
  "completed": true
}
```

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "user_id": 123,
    "title": "Complete project proposal",
    "description": "Finish and submit the project proposal by Friday",
    "completed": true,
    "created_at": "2026-02-05T10:30:00Z",
    "updated_at": "2026-02-05T13:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid request body (completed field missing or invalid)
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User ID in JWT doesn't match user_id in path
- `404 Not Found`: Task doesn't exist or doesn't belong to the user
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error processing request

---

## Common Error Response Format

All error responses follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

## Authentication Error Handling

When JWT tokens are invalid, expired, or missing, the API returns:
- Status code: `401 Unauthorized`
- Response body:
```json
{
  "detail": "Not authenticated"
}
```

## Validation Error Handling

When request validation fails, the API returns:
- Status code: `422 Unprocessable Entity`
- Response body:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "Field required",
      "type": "value_error.missing"
    }
  ]
}
```

## Data Formats

- **Dates/Times**: ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)
- **JSON**: All request/response bodies are JSON formatted
- **IDs**: Integer or UUID format depending on database configuration