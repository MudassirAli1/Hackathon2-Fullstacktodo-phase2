# API Contracts: Authentication & Security Integration

**Feature**: Authentication & Security Integration
**Date**: 2026-02-05
**Status**: Draft

## Overview

This document defines the API contracts for authentication endpoints that the frontend and backend will use to implement secure user authentication and authorization. These contracts specify the expected request/response formats, authentication requirements, and error handling patterns.

## Authentication Endpoints

### POST /api/auth/signup
**Description**: Create a new user account via Better Auth

**Request**:
```json
{
  "email": "user@example.com",
  "password": "secure_password_123",
  "name": "John Doe"
}
```

**Successful Response (201 Created)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_12345",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (400 Bad Request)**:
```json
{
  "success": false,
  "error": "Invalid email format or weak password"
}
```

**Error Response (409 Conflict)**:
```json
{
  "success": false,
  "error": "Email already registered"
}
```

---

### POST /api/auth/signin
**Description**: Authenticate an existing user

**Request**:
```json
{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_12345",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### POST /api/auth/logout
**Description**: Logout the current user (invalidate session)

**Headers**:
```
Authorization: Bearer {jwt_token}
```

**Request**:
```json
{}
```

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

## Protected Endpoints

All the following endpoints require a valid JWT token in the Authorization header:

**Required Header**:
```
Authorization: Bearer {jwt_token}
```

### GET /api/users/{userId}/tasks
**Description**: Retrieve all tasks for a specific user

**Parameters**:
- `userId` (path): The ID of the user whose tasks to retrieve (must match token's user ID)

**Successful Response (200 OK)**:
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

**Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Error Response (403 Forbidden)**:
```json
{
  "success": false,
  "error": "Access denied - cannot access another user's tasks"
}
```

---

### POST /api/users/{userId}/tasks
**Description**: Create a new task for a user

**Parameters**:
- `userId` (path): The ID of the user (must match token's user ID)

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

**Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Error Response (403 Forbidden)**:
```json
{
  "success": false,
  "error": "Access denied - cannot create tasks for another user"
}
```

---

### PUT /api/users/{userId}/tasks/{taskId}
**Description**: Update an existing task

**Parameters**:
- `userId` (path): The ID of the user (must match token's user ID)
- `taskId` (path): The ID of the task to update

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

**Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Error Response (403 Forbidden)**:
```json
{
  "success": false,
  "error": "Access denied - cannot update another user's task"
}
```

**Error Response (404 Not Found)**:
```json
{
  "success": false,
  "error": "Task not found"
}
```

---

### DELETE /api/users/{userId}/tasks/{taskId}
**Description**: Delete a specific task

**Parameters**:
- `userId` (path): The ID of the user (must match token's user ID)
- `taskId` (path): The ID of the task to delete

**Successful Response (200 OK)**:
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Error Response (403 Forbidden)**:
```json
{
  "success": false,
  "error": "Access denied - cannot delete another user's task"
}
```

**Error Response (404 Not Found)**:
```json
{
  "success": false,
  "error": "Task not found"
}
```

---

### PATCH /api/users/{userId}/tasks/{taskId}/complete
**Description**: Toggle the completion status of a task

**Parameters**:
- `userId` (path): The ID of the user (must match token's user ID)
- `taskId` (path): The ID of the task to update

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

**Error Response (401 Unauthorized)**:
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**Error Response (403 Forbidden)**:
```json
{
  "success": false,
  "error": "Access denied - cannot modify another user's task"
}
```

**Error Response (404 Not Found)**:
```json
{
  "success": false,
  "error": "Task not found"
}
```

## Common Error Response Format

All error responses follow this format:
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

## Authentication Error Handling

When JWT tokens are invalid, expired, or missing, the API returns:
- Status code: `401 Unauthorized`
- Response body:
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

## Validation Error Handling

When request validation fails, the API returns:
- Status code: `422 Unprocessable Entity`
- Response body:
```json
{
  "success": false,
  "error": "Validation error details"
}
```

## Security Requirements

1. All protected endpoints must validate the JWT token against the BETTER_AUTH_SECRET
2. The userId in the JWT token must match the userId in the request path
3. Requests with mismatched user IDs must return 403 Forbidden
4. All tokens must be validated for expiration before processing requests
5. Invalid tokens must result in 401 Unauthorized responses