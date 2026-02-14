---
name: auth-skill
description: Handle secure authentication flows including signup, signin, password hashing, JWT tokens, and Better Auth integration.
---

# Auth Skill – Secure Authentication

## Instructions

1. **User Signup**
   - Validate user input (email, password)
   - Hash passwords before saving
   - Prevent duplicate accounts
   - Store user securely in database

2. **User Signin**
   - Verify email and password
   - Compare hashed passwords
   - Handle invalid credentials safely
   - Return auth response on success

3. **Password Hashing**
   - Use strong hashing (bcrypt or argon2)
   - Never store plain-text passwords
   - Use salt automatically
   - Re-hash if security rules change

4. **JWT Authentication**
   - Generate access tokens on login
   - Include user ID and role in payload
   - Set token expiration
   - Verify token on protected routes

5. **Better Auth Integration**
   - Configure Better Auth provider
   - Handle sessions securely
   - Support email/password login
   - Plug into frontend and backend smoothly

## Best Practices
- Always hash passwords
- Use HTTPS only
- Keep JWT secret in environment variables
- Set short token expiry
- Validate all user input
- Separate auth logic from UI

## Example Flow
```ts
// Signup
User submits email + password
→ Validate input
→ Hash password
→ Save user
→ Return success

// Signin
User submits credentials
→ Verify password
→ Generate JWT
→ Return token
