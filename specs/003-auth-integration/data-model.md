# Data Model: Authentication & Security Integration

**Feature**: Authentication & Security Integration
**Date**: 2026-02-05
**Status**: Draft

## Overview

This document describes the data model for the authentication and security layer of the todo application. It outlines the authentication entities, their properties, and validation rules that the frontend and backend will work with.

## Entities

### User (Authentication)

**Description**: Represents an authenticated user managed by Better Auth

**Fields**:
- id: string - Unique identifier for the user (from Better Auth)
- email: string - User's email address (required for login)
- name: string (optional) - User's display name
- createdAt: string - Account creation timestamp
- lastLoginAt: string (optional) - Last login timestamp

**Validation**:
- email must be a valid email format
- id must be non-empty string
- createdAt must be a valid ISO timestamp

### JWT Token

**Description**: JSON Web Token for authentication between frontend and backend

**Fields**:
- token: string - The complete JWT token string
- userId: string - Extracted user identifier from token payload
- expiration: number - Unix timestamp for token expiration
- issuedAt: number - Unix timestamp for token creation
- issuer: string - Token issuer (typically the auth service)

**Validation**:
- Token must be properly formatted with 3 parts separated by dots
- Signature must be valid using the shared BETTER_AUTH_SECRET
- Expiration must not be in the past
- userId must be present in payload

### AuthSession

**Description**: Represents an active authentication session in the frontend

**Fields**:
- token: string - The JWT token value
- userId: string - Associated user identifier
- expiresAt: Date - Session expiration time (derived from JWT)
- isAuthenticated: boolean - Current authentication state
- user: User (optional) - User profile data

**Validation**:
- Token must be non-empty string
- UserId must match the token's subject
- ExpiresAt must be in the future
- IsAuthenticated must be boolean

### AuthRequest

**Description**: Represents authentication request data for API endpoints

**Fields**:
- email: string - User's email address
- password: string - User's password
- name: string (optional) - User's name (for signup)

**Validation**:
- Email must be valid email format
- Password must meet minimum strength requirements (8+ characters)
- Name must be 1-255 characters if provided

### AuthResponse

**Description**: Represents authentication response data from API endpoints

**Fields**:
- success: boolean - Whether the authentication was successful
- token: string (optional) - JWT token for successful authentication
- user: User (optional) - User profile data for successful authentication
- error: string (optional) - Error message for failed authentication

**Validation**:
- Success must be boolean
- If success is true, token and user must be provided
- If success is false, error message must be provided

## Relationships

### User → AuthSession
- One-to-one relationship (conceptually)
- A user can have one active session at a time
- Session is tied to specific user through userId

### AuthSession → JWT Token
- One-to-one relationship
- Each session corresponds to a specific JWT token
- Token contains the user identifier for session validation

## State Transitions

### Auth Session State Transitions
- Unauthenticated → Authenticating (when user initiates login/signup)
- Authenticating → Authenticated (when login/signup succeeds)
- Authenticated → Unauthenticated (when session expires or user logs out)
- Authenticated → Expired (when JWT token expires)

## Validation Rules from Requirements

1. **FR-001**: User signup and signin must be handled by Better Auth with email/password authentication
2. **FR-002**: JWT tokens must be generated upon successful authentication via Better Auth
3. **FR-003**: All protected endpoints must verify JWT tokens using shared BETTER_AUTH_SECRET
4. **FR-004**: Invalid, expired, or malformed JWT tokens must be rejected with 401 status
5. **FR-005**: User isolation must be enforced by verifying authenticated user matches resource owner
6. **FR-006**: Authentication must be stateless (no server-side session storage)
7. **FR-007**: JWT tokens must contain appropriate user claims and expiration times
8. **FR-008**: JWT tokens must be transmitted securely using HTTPS
9. **FR-009**: JWT tokens must have configurable expiration periods (e.g., 7 days)
10. **FR-010**: Users must be prevented from accessing resources belonging to other users
11. **FR-011**: Token refresh scenarios must be handled gracefully when possible
12. **FR-012**: JWT signature must be validated using shared BETTER_AUTH_SECRET

## API Request/Response Models

### LoginRequest
- email: string (Required) - User's email address
- password: string (Required) - User's password

### LoginResponse
- success: boolean - Whether login was successful
- token: string (Optional) - JWT token if successful
- user: User object (Optional) - User data if successful
- error: string (Optional) - Error message if failed

### SignupRequest
- email: string (Required) - User's email address
- password: string (Required) - User's password
- name: string (Optional) - User's display name

### ProtectedResourceResponse
- data: varies - The requested resource data
- success: boolean - Whether request was successful
- error: string (Optional) - Error message if authorization failed