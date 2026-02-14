# Quickstart Guide: Frontend & UI Layer

**Feature**: Frontend & UI Layer
**Date**: 2026-02-05

## Overview

This guide provides the essential information to start developing the frontend & UI layer for the todo application. This includes setting up the development environment, understanding the project structure, and key development workflows.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Access to the backend API endpoints
- Better Auth configuration details

## Setup Instructions

### 1. Clone and Initialize
```bash
# Navigate to your project directory
cd frontend/

# Install dependencies
npm install
# or
yarn install
```

### 2. Environment Configuration
Create a `.env.local` file in the frontend root with the following variables:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
BETTER_AUTH_SECRET=your_jwt_secret_here
NEXT_PUBLIC_JWT_EXPIRES_IN=7d
```

### 3. Run Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js 16+ App Router pages
│   │   ├── (auth)/            # Authentication pages (signup, signin)
│   │   │   ├── page.tsx
│   │   │   └── [...]/layout.tsx
│   │   ├── dashboard/         # Main dashboard with task management
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── globals.css        # Global styles
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable UI components
│   │   ├── TaskItem/          # Individual task component
│   │   ├── TaskList/          # Task list container
│   │   ├── TaskForm/          # Add/edit task form
│   │   ├── Header/            # Navigation header with user info/logout
│   │   └── ui/                # Base UI primitives (buttons, modals, etc.)
│   ├── services/              # API clients and business logic
│   │   ├── api-client.ts      # REST API client with JWT handling
│   │   ├── auth-service.ts    # Authentication service
│   │   └── task-service.ts    # Task-specific operations
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts         # Authentication state management
│   │   └── useTasks.ts        # Task state management
│   └── lib/                   # Utility functions
│       └── utils.ts
```

## Key Development Workflows

### 1. Adding a New UI Component

1. Create the component in the `components/` directory
2. Follow the naming convention: `ComponentName/ComponentName.tsx`
3. Include TypeScript interfaces for props
4. Add responsive styling with Tailwind CSS
5. Export the component from the index file

### 2. API Integration

1. Add API endpoints to `services/api-client.ts`
2. Create specific service functions in relevant service files
3. Use the service in your React components with proper loading/error states
4. Handle JWT token attachment automatically

### 3. Authentication Flow

1. Use `useAuth` hook to check authentication status
2. Redirect unauthenticated users to the login page
3. Include JWT tokens in API requests automatically
4. Handle token expiration gracefully

### 4. Task Operations

The 5 core task operations to implement:
- **View**: Display user's tasks in the dashboard
- **Add**: Create new tasks via the task form
- **Update**: Modify existing task details
- **Delete**: Remove tasks from the list
- **Mark Complete**: Toggle task completion status

## Testing Guidelines

### Component Testing
- Use React Testing Library for UI component tests
- Test rendering with various data states (loading, error, success)
- Test user interactions (clicks, form submissions)

### Integration Testing
- Test API integration with mock responses
- Verify JWT token handling
- Test authentication flow

### Responsive Testing
- Test on various screen sizes (320px mobile to 1920px desktop)
- Verify component adaptability
- Test touch interactions on mobile views

## Common Commands

```bash
# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Troubleshooting

### API Requests Failing
- Check if the backend API is running
- Verify the `NEXT_PUBLIC_API_BASE_URL` in your environment
- Confirm JWT token is properly attached to requests

### Authentication Issues
- Ensure `BETTER_AUTH_SECRET` matches the backend
- Check if the auth API endpoints are accessible
- Verify token expiration handling

### Responsive Design Problems
- Use Chrome DevTools to simulate different screen sizes
- Check Tailwind CSS breakpoints implementation
- Test mobile touch interactions