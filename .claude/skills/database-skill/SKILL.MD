---
name: database-skill
description: Learn to create tables, manage migrations, and design database schemas efficiently.
---

# Database Skill

## Instructions

1. **Database Setup**
   - Install and configure your database (PostgreSQL, MySQL, SQLite, etc.)
   - Establish a secure connection
   - Configure environment variables

2. **Schema Design**
   - Define entities and relationships
   - Normalize data to reduce redundancy
   - Use primary keys, foreign keys, and indexes
   - Maintain consistent naming conventions

3. **Table Creation**
   - Write CREATE TABLE statements
   - Define proper column types and constraints
   - Set default values where necessary
   - Add indexes for performance optimization

4. **Migrations**
   - Use migration tools (e.g., Sequelize, TypeORM, Prisma, Alembic)
   - Generate migration scripts
   - Apply and rollback migrations safely
   - Keep migrations version-controlled

5. **Best Practices**
   - Keep tables and columns well-documented
   - Use meaningful table and column names
   - Avoid storing sensitive data in plain text
   - Design with scalability and future changes in mind

## Example Structure

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table with foreign key
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
