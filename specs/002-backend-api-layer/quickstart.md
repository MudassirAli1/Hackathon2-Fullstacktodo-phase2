# Quickstart Guide: Backend & API Layer

**Feature**: Backend & API Layer
**Date**: 2026-02-05

## Overview

This guide provides essential information to start developing the backend API layer for the todo application. It covers setting up the development environment, understanding the project structure, and key development workflows.

## Prerequisites

- Python 3.11+ installed
- pip package manager
- PostgreSQL (local installation or connection to Neon Serverless PostgreSQL)
- Git version control

## Setup Instructions

### 1. Clone and Navigate to Backend Directory
```bash
cd backend/
```

### 2. Create Virtual Environment
```bash
python -m venv venv
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration
Create a `.env` file in the backend root with the following variables:
```env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/todo_db
BETTER_AUTH_SECRET=your_jwt_secret_from_frontend
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DELTA=604800  # 7 days in seconds
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### 5. Database Setup
Initialize the database and run migrations:
```bash
# Set environment variables
export DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/todo_db

# Run initial migration
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### 6. Run Development Server
```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with documentation at `http://localhost:8000/docs`

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py            # Dependency injection and authentication
│   │   ├── auth.py            # JWT verification and user context
│   │   └── tasks.py           # Task CRUD endpoints
│   ├── models/
│   │   ├── __init__.py
│   │   ├── base.py            # Base SQLModel class
│   │   └── task.py            # Task model definition
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py    # JWT validation logic
│   │   └── task_service.py    # Business logic for task operations
│   └── database/
│       ├── __init__.py
│       └── database.py        # Database connection and session management
├── tests/
│   ├── conftest.py            # Pytest fixtures
│   ├── test_auth.py           # Authentication tests
│   ├── test_tasks.py          # Task endpoint tests
│   └── test_models.py         # Model validation tests
├── alembic/
│   ├── versions/              # Database migration files
│   └── env.py
├── alembic.ini               # Alembic configuration
├── requirements.txt          # Python dependencies
├── docker-compose.yml        # Container configuration
└── main.py                   # FastAPI application entry point
```

## Key Development Workflows

### 1. Adding a New Model
1. Create the SQLModel in the `models/` directory
2. Import and register in the models' `__init__.py`
3. Run alembic to generate and apply migration

### 2. Adding a New API Endpoint
1. Add the route function in the appropriate file in `api/`
2. Include proper authentication dependency
3. Use Pydantic models for request/response validation
4. Add appropriate error handling

### 3. Database Migration
```bash
# After changing models, generate migration:
alembic revision --autogenerate -m "Description of changes"

# Apply the migration:
alembic upgrade head
```

### 4. Authentication Flow
1. Use `get_current_user` dependency in endpoints requiring authentication
2. The JWT token is validated automatically
3. User ID from token is matched against URL parameters for authorization

### 5. Error Handling
- Use HTTPException for validation and authorization errors
- Return consistent error responses using the defined format
- Log errors appropriately using the configured logger

## Testing Guidelines

### Unit Testing
- Test individual service functions separately
- Mock database calls with fixtures
- Validate business logic and error cases

### Integration Testing
- Test complete API request/response cycles
- Use test database with proper cleanup
- Test authentication and authorization flows

### Running Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src/

# Run specific test file
pytest tests/test_tasks.py
```

## Common Commands

```bash
# Run development server
uvicorn main:app --reload --port 8000

# Run tests
pytest

# Run tests with coverage
pytest --cov=src/ --cov-report=html

# Format code with black
black src/

# Lint code with flake8
flake8 src/

# Run migration
alembic upgrade head

# Create new migration
alembic revision --autogenerate -m "Description"
```

## API Endpoint Examples

### Creating a Task
```bash
curl -X POST http://localhost:8000/api/v1/users/123/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "New Task", "description": "Task description"}'
```

### Retrieving Tasks
```bash
curl -X GET http://localhost:8000/api/v1/users/123/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Database Connection Issues
- Check if PostgreSQL server is running
- Verify `DATABASE_URL` in environment variables
- Ensure credentials in the connection string are correct

### Authentication Failures
- Verify `BETTER_AUTH_SECRET` matches the one used in frontend/Better Auth
- Check that JWT tokens are being sent in the correct header format
- Ensure the token hasn't expired

### API Validation Errors
- Check that request bodies match the Pydantic model definitions
- Verify all required fields are present
- Confirm field values meet validation constraints