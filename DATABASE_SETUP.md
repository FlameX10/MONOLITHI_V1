# PostgreSQL Database Setup Guide

## Prerequisites
- PostgreSQL 12+ installed ([Download](https://www.postgresql.org/download/))
- PostGIS extension installed with PostgreSQL
- pgAdmin 4 (optional, for GUI management)

---

## Step 1: Install PostgreSQL with PostGIS

### Windows
1. Download PostgreSQL installer: https://www.postgresql.org/download/windows/
2. During installation:
   - Set password for `postgres` user (remember this!)
   - Enable "Stack Builder" at the end
3. Run Stack Builder → PostgreSQL 15 Server → PostGIS extensions
4. Select all PostGIS components and complete installation

### macOS
```bash
brew install postgresql postgis
brew services start postgresql
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib postgis
sudo systemctl start postgresql
```

---

## Step 2: Create Database and User

### Using pgAdmin (GUI - Recommended for Windows):
1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
   - **Name:** `aurora_db`
   - **Owner:** postgres (for now)
   - Click "Save"
3. Right-click the new database → "Query Tool"
   - Paste the SQL below and execute

### Using Command Line (psql):
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE aurora_db;

# Connect to new database
\c aurora_db

# Enable PostGIS
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

# Create user with password
CREATE USER aurora WITH ENCRYPTED PASSWORD 'aurora';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE aurora_db TO aurora;
GRANT ALL PRIVILEGES ON SCHEMA public TO aurora;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aurora;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO aurora;

# Exit
\q
```

---

## Step 3: Initialize Database Schema

Navigate to the backend directory and run:

```bash
# From: c:\Users\paras\OneDrive\Desktop\swami hackathon\adaptive-mining-monitoring\backend

# Windows PowerShell
$env:DB_HOST = "localhost"
$env:DB_PORT = "5432"
$env:DB_NAME = "aurora_db"
$env:DB_USER = "aurora"
$env:DB_PASSWORD = "aurora"

# Linux/macOS
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=aurora_db
export DB_USER=aurora
export DB_PASSWORD=aurora

# Create tables
python -c "
from db.connection import initialize_db
from db.connection import engine
initialize_db()

if engine:
    with open('db/schema.sql', 'r') as f:
        sql = f.read()
    with engine.begin() as conn:
        for statement in sql.split(';'):
            if statement.strip():
                conn.execute(statement)
    print('✅ Database schema created successfully')
else:
    print('❌ Failed to initialize database')
"
```

---

## Step 4: Configure Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```
# backend/.env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aurora_db
DB_USER=aurora
DB_PASSWORD=aurora
GEE_PROJECT=monolith-484408
```

**Important:** 
- Match the credentials you set in Step 2
- For production, use strong passwords and environment-specific values

---

## Step 5: Test Connection

Run the test script:

```bash
# From backend directory
python -c "
from db.connection import initialize_db
if initialize_db():
    print('✅ Database connection successful!')
else:
    print('❌ Database connection failed!')
"
```

Expected output: `✅ Database connection successful!`

---

## Troubleshooting

### Error: "could not connect to server: Connection refused"
- **Cause:** PostgreSQL not running
- **Fix:** 
  - Windows: Start PostgreSQL service from Services
  - macOS: `brew services start postgresql`
  - Linux: `sudo systemctl start postgresql`

### Error: "FATAL: password authentication failed for user 'aurora'"
- **Cause:** Wrong password or user doesn't exist
- **Fix:** 
  1. In pgAdmin, right-click user "aurora" → Properties
  2. Set password to `aurora` (or your chosen password)
  3. Update `.env` file with correct password

### Error: "CreateProcessError: [WinError 2] The system cannot find the file specified" (psql)
- **Cause:** PostgreSQL bin directory not in PATH
- **Fix:** 
  1. Add `C:\Program Files\PostgreSQL\15\bin` to Windows PATH
  2. Restart PowerShell/terminal

### Error: "database 'aurora_db' does not exist"
- **Cause:** Database not created or name mismatch
- **Fix:** 
  1. Open pgAdmin
  2. Verify database name matches `.env` file
  3. Recreate if necessary

### PostGIS Extension Not Available
- **Fix:**
  ```bash
  psql -U postgres -d aurora_db -c "CREATE EXTENSION postgis;"
  ```

---

## Useful Commands

```bash
# Connect to database
psql -h localhost -U aurora -d aurora_db

# List all databases
\l

# List all tables
\dt

# Check PostGIS version
SELECT postgis_version();

# View table schema
\d pixel_timeseries

# Export data to CSV
COPY (SELECT * FROM pixel_timeseries LIMIT 100) 
TO '/path/to/export.csv' 
WITH CSV HEADER;
```

---

## Next Steps

1. Start the backend server:
```bash
cd backend
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

2. The backend will now automatically initialize the database on startup
3. Check server logs for `✅ Database connection successful`

---

## Default Credentials for Development

| Parameter | Value |
|-----------|-------|
| **Host** | localhost |
| **Port** | 5432 |
| **Database** | aurora_db |
| **User** | aurora |
| **Password** | aurora |

⚠️ **Change these credentials in production!**

---

## For More Help

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- PostGIS Documentation: https://postgis.net/documentation/
- SQLAlchemy Documentation: https://docs.sqlalchemy.org/
