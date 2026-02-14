# API Contracts: Frontend & UI Layer

**Feature**: Frontend & UI Layer
**Date**: 2026-02-05
**Status**: Draft

## Overview

This document defines the API contracts that the frontend UI layer will consume. These contracts are derived from the functional requirements and specify the expected API endpoints, request/response formats, and authentication requirements.

## Authentication Endpoints

### POST /api/auth/signup
**Description**: Create a new user account

**Request**:
```json
{
  "email": "user@example.com",
  "password": "secure_password_123",
  "name": "John Doe"
}
```

**Response (Success)**:
- Status: 201 Created
```json
{
  "success": true,
  "user": {
    "id": "user_12345",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}
```

**Response (Error)**:
- Status: 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error message"
}
```

### POST /api/auth/signin
**Description**: Authenticate an existing user

**Request**:
```json
{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**Response (Success)**:
- Status: 200 OK
```json
{
  "success": true,
  "user": {
    "id": "user_12345",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt_token_here"
}
```

**Response (Error)**:
- Status: 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

### POST /api/auth/logout
**Description**: Log out the current user

**Headers**:
- Authorization: Bearer {jwt_token}

**Request**:
```json
{}
```

**Response (Success)**:
- Status: 200 OK
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

## Task Management Endpoints

### GET /api/users/{userId}/tasks
**Description**: Retrieve all tasks for a specific user

**Headers**:
- Authorization: Bearer {jwt_token}

**Response (Success)**:
- Status: 200 OK
```json
{
  "success": true,
  "tasks": [
    {
      "id": "task_12345",
      "userId": "user_12345",
      "title": "Complete project proposal",
      "description": "Finish and submit the project proposal by Friday",
      "completed": false,
      "createdAt": "2026-02-05T10:30:00Z",
      "updatedAt": "2026-02-05T10:30:00Z"
    }
  ]
}
```

**Response (Error)**:
- Status: 401 Unauthorized (invalid token)
- Status: 403 Forbidden (user trying to access other's tasks)
- Status: 404 Not Found (user not found)

### POST /api/users/{userId}/tasks
**Description**: Create a new task for a user

**Headers**:
- Authorization: Bearer {jwt_token}

**Request**:
```json
{
  "title": "New task title",
  "description": "Detailed task description (optional)",
  "completed": false
}
```

**Response (Success)**:
- Status: 201 Created
```json
{
  "success": true,
  "task": {
    "id": "task_67890",
    "userId": "user_12345",
    "title": "New task title",
    "description": "Detailed task description (optional)",
    "completed": false,
    "createdAt": "2026-02-05T11:00:00Z",
    "updatedAt": "2026-02-05T11:00:00Z"
  }
}
```

**Response (Error)**:
- Status: 400 Bad Request (validation error)
- Status: 401 Unauthorized (invalid token)
- Status: 403 Forbidden (user trying to create task for another user)

### PUT /api/users/{userId}/tasks/{taskId}
**Description**: Update an existing task

**Headers**:
- Authorization: Bearer {jwt_token}

**Request**:
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "completed": true
}
```

**Response (Success)**:
- Status: 200 OK
```json
{
  "success": true,
  "task": {
    "id": "task_67890",
    "userId": "user_12345",
    "title": "Updated task title",
    "description": "Updated description",
    "completed": true,
    "createdAt": "2026-02-05T11:00:00Z",
    "updatedAt": "2026-02-05T12:00:00Z"
  }
}
```

**Response (Error)**:
- Status: 400 Bad Request (validation error)
- Status: 401 Unauthorized (invalid token)
- Status: 403 Forbidden (user trying to update another user's task)
- Status: 404 Not Found (task not found)

### DELETE /api/users/{userId}/tasks/{taskId}
**Description**: Delete a specific task

**Headers**:
- Authorization: Bearer {jwt_token}

**Response (Success)**:
- Status: 200 OK
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Response (Error)**:
- Status: 401 Unauthorized (invalid token)
- Status: 403 Forbidden (user trying to delete another user's task)
- Status: 404 Not Found (task not found)

### PATCH /api/users/{userId}/tasks/{taskId}/complete
**Description**: Mark a task as complete or incomplete

**Headers**:
- Authorization: Bearer {jwt_token}

**Request**:
```json
{
  "completed": true
}
```

**Response (Success)**:
- Status: 200 OK
```json
{
  "success": true,
  "task": {
    "id": "task_67890",
    "userId": "user_12345",
    "title": "Task title",
    "description": "Task description",
    "completed": true,
    "createdAt": "2026-02-05T11:00:00Z",
    "updatedAt": "2026-02-05T13:00:00Z"
  }
}
```

**Response (Error)**:
- Status: 400 Bad Request (validation error)
- Status: 401 Unauthorized (invalid token)
- Status: 403 Forbidden (user trying to update another user's task)
- Status: 404 Not Found (task not found)