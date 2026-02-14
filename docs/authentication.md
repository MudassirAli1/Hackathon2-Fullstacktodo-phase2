# Authentication & Security Integration

## Overview

This document describes the authentication and security integration for the todo application. It covers how Better Auth is configured, JWT token handling, and user isolation mechanisms.

## Architecture

### Frontend Authentication
- Better Auth handles user signup and signin flows
- JWT tokens are stored in browser's localStorage
- All API requests include JWT token in Authorization header
- Token expiration is checked before making requests

### Backend Authentication
- JWT tokens are verified on all protected endpoints using shared BETTER_AUTH_SECRET
- FastAPI middleware validates tokens and extracts user information
- User isolation ensures each user can only access their own tasks
- Stateless authentication with no server-side session storage

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/signin` - Authenticate existing user
- `POST /api/auth/logout` - Logout user (confirms client-side token removal)

### Protected Task Endpoints
All task endpoints require valid JWT token in Authorization header:
- `GET /api/users/{userId}/tasks` - Get all tasks for user
- `POST /api/users/{userId}/tasks` - Create new task
- `GET /api/users/{userId}/tasks/{taskId}` - Get specific task
- `PUT /api/users/{userId}/tasks/{taskId}` - Update task
- `DELETE /api/users/{userId}/tasks/{taskId}` - Delete task
- `PATCH /api/users/{userId}/tasks/{taskId}/complete` - Toggle completion status

## Security Features

### JWT Token Validation
- All protected endpoints verify JWT tokens using HS256 algorithm
- Tokens are validated against shared BETTER_AUTH_SECRET
- Expired tokens are automatically rejected with 401 status

### User Isolation
- Each API request verifies that user ID in JWT token matches the requested resource owner
- Users cannot access, modify, or delete tasks belonging to other users
- All authorization checks happen server-side for security

## Configuration

### Environment Variables
- `BETTER_AUTH_SECRET`: Shared secret for JWT signing and verification
- `JWT_ALGORITHM`: Algorithm used for JWT signing (default: HS256)
- `JWT_EXPIRATION_DELTA`: Token expiration time in seconds (default: 604800 for 7 days)
- `ENVIRONMENT`: Environment mode (development, production)