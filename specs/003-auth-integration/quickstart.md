# Quickstart Guide: Authentication & Security Integration

**Feature**: Authentication & Security Integration
**Date**: 2026-02-05

## Overview

This guide provides essential information to start developing the authentication and security features for the todo application. It covers setting up Better Auth, implementing JWT token handling, and integrating authentication between frontend and backend.

## Prerequisites

- Node.js 18+ installed
- Python 3.11+ with pip
- Better Auth configured with JWT support
- BETTER_AUTH_SECRET environment variable set
- FastAPI backend with SQLModel ORM configured

## Setup Instructions

### 1. Clone and Navigate to Project Directory
```bash
cd F:\Hackathon2-q4\phase-2\
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend/

# Create virtual environment
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend/

# Install dependencies
npm install
```

### 4. Environment Configuration
Create a `.env` file in both frontend and backend directories:

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_SECRET=your_jwt_secret_here
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Backend (.env)**:
```env
BETTER_AUTH_SECRET=your_jwt_secret_here
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/todo_db
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DELTA=604800  # 7 days in seconds
ENVIRONMENT=development
```

**Critical**: The `BETTER_AUTH_SECRET` value must be identical in both frontend and backend configurations for proper JWT verification.

### 5. Run Development Servers
```bash
# Start backend
cd backend/
uvicorn main:app --reload --port 8000

# Start frontend
cd frontend/
npm run dev
```

## Project Structure

```
backend/
├── main.py                  # FastAPI application entry point
├── src/
│   ├── api/
│   │   ├── deps.py          # Authentication dependency injection
│   │   └── auth.py          # Authentication endpoints
│   ├── models/
│   │   ├── auth.py          # Authentication data models
│   │   └── base.py          # Base model classes
│   ├── services/
│   │   ├── auth_service.py  # Authentication business logic
│   │   └── jwt_service.py   # JWT token handling
│   ├── utils/
│   │   ├── jwt_utils.py     # JWT utilities
│   │   └── security.py      # Security utilities
│   └── config/
│       └── settings.py      # Configuration settings
└── tests/
    ├── test_auth.py         # Authentication tests
    └── test_jwt.py          # JWT handling tests

frontend/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx        # Login form component
│   │   │   ├── SignupForm.tsx       # Signup form component
│   │   │   └── ProtectedRoute.tsx   # Protected route wrapper
│   │   └── Task/
│   │       ├── TaskList.tsx         # Task list component
│   │       ├── TaskItem.tsx         # Individual task component
│   │       └── TaskForm.tsx         # Task creation/editing form
│   ├── hooks/
│   │   ├── useAuth.ts               # Authentication hook
│   │   └── useTasks.ts              # Task management hook
│   ├── services/
│   │   ├── api.ts                   # API client with authentication
│   │   ├── auth.ts                  # Authentication service
│   │   └── tasks.ts                 # Task API service
│   ├── types/
│   │   ├── auth.ts                  # Authentication type definitions
│   │   └── task.ts                  # Task type definitions
│   └── utils/
│       ├── auth.ts                  # Authentication utilities
│       └── jwt.ts                   # JWT utilities
├── pages/
│   ├── index.tsx                    # Landing page (login/signup)
│   ├── dashboard.tsx                # Main dashboard with protected routes
│   └── _app.tsx                     # Application root with auth provider
```

## Key Development Workflows

### 1. Adding New Authentication Endpoints
1. Create the endpoint function in `backend/src/api/auth.py`
2. Add proper JWT token validation using the authentication dependency
3. Ensure user isolation by comparing token user ID with request user ID
4. Add to the router in main application

### 2. Creating Protected Routes in Frontend
1. Use the `useAuth` hook to check authentication status
2. Attach JWT token to all API requests in the Authorization header
3. Handle token expiration scenarios gracefully
4. Implement proper error handling for authentication failures

### 3. User Isolation Implementation
1. Always verify that the user ID in the JWT token matches the resource owner
2. Return 403 Forbidden or 404 Not Found for unauthorized access attempts
3. Never expose information about whether resources exist for other users

## Security Best Practices

### JWT Token Handling
- Store tokens securely (preferably in httpOnly cookies or secure local storage)
- Always verify token signature using the shared BETTER_AUTH_SECRET
- Check token expiration before processing requests
- Implement proper token refresh mechanisms when possible

### API Security
- Validate all input data on both frontend and backend
- Use HTTPS for all communication between frontend and backend
- Never trust client-side authentication alone
- Implement rate limiting for authentication endpoints
- Sanitize and validate all user inputs

### User Data Isolation
- Always compare token user ID with requested resource owner
- Use parameterized queries to prevent SQL injection
- Validate user permissions for every request to protected resources
- Log authentication-related activities for security monitoring

## Testing Authentication Flows

### Manual Testing Steps
1. Test user signup with valid credentials
2. Verify JWT token is generated and properly formatted
3. Test user signin with correct credentials
4. Verify token can be used to access protected endpoints
5. Test invalid token scenarios (expired, malformed, missing)
6. Verify user isolation (users can't access other users' data)

### API Testing
```bash
# Test signup
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'

# Test signin
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Test protected endpoint with token
curl -X GET http://localhost:8000/api/users/{userId}/tasks \
  -H "Authorization: Bearer {jwt_token}"
```

## Troubleshooting

### Common Issues

**Issue**: Backend rejects valid JWT tokens
**Cause**: Mismatched BETTER_AUTH_SECRET between frontend and backend
**Solution**: Verify both environments use the same secret value

**Issue**: User isolation not working
**Cause**: Not validating user ID in token against requested resource owner
**Solution**: Ensure backend compares token user ID with request resource owner

**Issue**: Token expires during session
**Cause**: Short expiration time configured
**Solution**: Adjust JWT_EXPIRATION_DELTA to appropriate value

**Issue**: CORS errors during authentication
**Cause**: Frontend and backend on different ports
**Solution**: Configure proper CORS settings in FastAPI application