---
name: backend-skill
description: Generate backend routes, handle requests/responses, and connect to databases. Use for API and server development.
---

# Backend Skill

## Instructions

1. **Routing**
   - Define RESTful routes (GET, POST, PUT, DELETE)
   - Organize routes by resource (e.g., /users, /products)
   - Use route parameters and query strings efficiently

2. **Request & Response Handling**
   - Parse incoming request bodies (JSON, form-data)
   - Validate and sanitize user input
   - Send structured responses with appropriate status codes
   - Handle errors gracefully with clear messages

3. **Database Integration**
   - Connect to SQL or NoSQL databases
   - Perform CRUD operations
   - Use connection pooling for efficiency
   - Ensure secure access and prevent injection attacks

## Best Practices
- Keep routes organized and modular
- Always validate and sanitize input
- Use meaningful HTTP status codes
- Follow DRY (Don't Repeat Yourself) principle
- Implement logging and error handling

## Example Structure
```javascript
// server.js
import express from 'express';
import connectDB from './db.js';
import userRoutes from './routes/users.js';

const app = express();
connectDB();

app.use(express.json());
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});

app.listen(5000, () => console.log('Server running on port 5000'));
