# Database Setup Guide

## Overview
This backend now uses PostgreSQL hosted on Render.com with automatic migrations.

## Configuration

### Environment Variables
Create a `.env` file in the backend directory with the following variables:

```env
DB_HOST=<host>
DB_PORT=<port>
DB_NAME=<dbname>
DB_USER=<user>
DB_PASSWORD=<your-password>
PORT=<app-port>
NODE_ENV=development
```

**Note:** The `.env` file is gitignored for security. Use `.env.example` as a template.

## Commands

### Development
```bash
# Run migrations and start dev server
npm run start:dev

# Or just run dev without migrations
npm run dev

# Run migrations only
npm run migrate
```

### Production
```bash
# Build the project
npm run build

# Run migrations (production)
npm run migrate:prod

# Start server (production)
npm run start
```

## How Migrations Work

1. Migrations are stored in `/migrations` directory
2. Migrations are tracked in the `pgmigrations` table
3. Each migration runs only once (idempotent)
4. In development: Run with `npm run start:dev` (auto-runs migrations)
5. In production: Use `preDeployCommand` in render.yaml to run migrations before deployment

### Creating New Migrations

To create a new migration, add a file in the `migrations/` directory:
- Filename format: `<timestamp>_<description>.js`
- Example: `1710000000000_create-agents-table.js`

## API Endpoint

### POST /agent
Creates a new agent in the database.

**Request Body:**
```json
{
  "name": "Agent name",
}
```

**Success Response (201):**
```json
{
  "message": "Agent created successfully",
  "data": {
    "id": 1,
    "name": "Agent name",
    "createdAt": "2025-01-15T10:30:00.000Z",
    "updatedAt": "2025-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Missing required fields",
  "details": {
    "name": "Name is required",
  }
}
```

**Error Response (500):**
```json
{
  "error": "Failed to save agent",
  "message": "Database error message"
}
```

## Testing the Connection

The application automatically tests the database connection on startup. Check the console for:
- `✓ Connected to PostgreSQL database`
- `✓ Database connection test successful`

## Production Deployment

### Recommended Approach for Render.com

**Option 1: Using render.yaml (RECOMMENDED)**
We've included a `render.yaml` file that configures:
- `preDeployCommand: npm run migrate:prod` - Runs migrations ONCE before deployment
- Prevents race conditions with multiple instances
- Separates migration concerns from app startup

Simply connect your repo to Render and it will use this configuration automatically.

**Option 2: Manual Configuration in Render Dashboard**
1. Set environment variables in Render dashboard
2. Ensure `NODE_ENV=production` (enables SSL for database connection)
3. Build Command: `npm install && npm run build`
4. **Pre-Deploy Command**: `npm run migrate:prod` (⚠️ This is the key!)
5. Start Command: `npm run start`

### Why Not Run Migrations in the Start Script?

Running migrations in the start script has several issues:
- **Race conditions**: Multiple instances might run migrations simultaneously
- **Slower deployments**: Each instance waits for migrations
- **Rollback complexity**: Can't separate migration rollbacks from app rollbacks
- **Health check failures**: App might not be ready while migrations run

The `preDeployCommand` approach:
- ✅ Runs migrations once before any instances start
- ✅ Prevents race conditions
- ✅ Faster instance startup
- ✅ Clear separation of concerns

## SSL Configuration

- **Development:** SSL is disabled for easier local development
- **Production:** SSL is automatically enabled when `NODE_ENV=production`

## Graceful Shutdown

The application handles graceful shutdown:
- Closes HTTP server
- Closes database connection pool
- Responds to SIGTERM and SIGINT signals
