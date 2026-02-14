# Todo App - Quick Start Guide

## ✅ System Status

**Backend API**: http://localhost:8001 ✓ Running
**Frontend App**: http://localhost:3001 ✓ Running
**Database**: SQLite initialized ✓ Ready

## 🚀 How to Use the Application

### 1. Open the Application
Navigate to: **http://localhost:3001**

### 2. Create an Account
- Enter your email, password, and name
- Click "Sign Up"
- You'll be automatically logged in and redirected to the dashboard

### 3. Manage Your Tasks
- **Create**: Click "+ Add Task" button
- **Complete**: Click the checkbox next to a task
- **Edit**: Click on a task to edit it
- **Delete**: Click the delete button on a task

### 4. Sign Out
- Click the sign out button in the header
- Your session will be cleared

### 5. Sign Back In
- Use the same email and password
- You'll see your tasks again

## 🔧 Server Management

### Stop Servers
Both servers are running in the background. To stop them:

**Backend:**
```bash
# Find the process
netstat -ano | findstr :8001
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Frontend:**
```bash
# Find the process
netstat -ano | findstr :3001
# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Restart Servers
**Backend:**
```bash
cd backend
python -m uvicorn main:app --reload --port 8001
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## 📝 API Endpoints (for testing)

All endpoints require JWT token in Authorization header (except signup/signin):
```
Authorization: Bearer <your-jwt-token>
```

### Authentication
- POST `/api/auth/signup` - Register new user
- POST `/api/auth/signin` - Login
- POST `/api/auth/logout` - Logout

### Tasks
- GET `/api/users/{user_id}/tasks` - Get all tasks
- POST `/api/users/{user_id}/tasks` - Create task
- GET `/api/users/{user_id}/tasks/{task_id}` - Get specific task
- PUT `/api/users/{user_id}/tasks/{task_id}` - Update task
- PATCH `/api/users/{user_id}/tasks/{task_id}/complete` - Toggle completion
- DELETE `/api/users/{user_id}/tasks/{task_id}` - Delete task

## 🐛 Troubleshooting

### Frontend not loading?
- Check if port 3001 is accessible
- Clear browser cache
- Check browser console for errors

### Backend not responding?
- Verify backend is running: `curl http://localhost:8001/health`
- Check backend logs in the terminal

### CORS errors?
- Ensure backend CORS middleware is configured for http://localhost:3001
- Check browser console for specific CORS error messages

### Authentication issues?
- Clear localStorage in browser DevTools
- Sign up with a new account
- Check JWT token expiration (7 days by default)

## 📁 Important Files

- `backend/.env` - Backend configuration
- `frontend/.env` - Frontend configuration
- `backend/todo_app.db` - SQLite database
- `CONNECTION_FIXES.md` - Detailed list of all fixes applied

## 🎉 You're All Set!

Open http://localhost:3001 in your browser and start managing your tasks!
