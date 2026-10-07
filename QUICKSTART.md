# Quick Start - PostgreSQL Setup (Windows)

## TL;DR - 5 Minutes Setup

### 1. Download & Install PostgreSQL
   - Go to: https://www.postgresql.org/download/windows/
   - Download the installer (latest version)
   - Run installer → follow prompts
   - **Remember the postgres password you set!**
   - When asked about Stack Builder → click YES
   - In Stack Builder: Select PostgreSQL → PostGIS → Install

### 2. Open PowerShell as Administrator

```powershell
# Add PostgreSQL to PATH
$env:Path += ";C:\Program Files\PostgreSQL\15\bin"

# Connect to PostgreSQL (use the password you set)
psql -U postgres
```

### 3. Copy-Paste This in psql:

```sql
CREATE DATABASE aurora_db;
\c aurora_db
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;
CREATE USER aurora WITH ENCRYPTED PASSWORD 'aurora';
GRANT ALL PRIVILEGES ON DATABASE aurora_db TO aurora;
GRANT ALL PRIVILEGES ON SCHEMA public TO aurora;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO aurora;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO aurora;
\q
```

### 4. Create `.env` in `backend/` folder

File: `c:\Users\paras\OneDrive\Desktop\swami hackathon\adaptive-mining-monitoring\backend\.env`

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aurora_db
DB_USER=aurora
DB_PASSWORD=aurora
GEE_PROJECT=monolith-484408
```

### 5. Restart Backend Server

```bash
cd backend
python -m uvicorn app:app --reload
```

✅ Look for: `✅ Database connection successful`

---

## Common Issues

| Error | Fix |
|-------|-----|
| `psql: command not found` | Add PostgreSQL bin to PATH or use full path: `"C:\Program Files\PostgreSQL\15\bin\psql"` |
| `password authentication failed` | Run `psql -U postgres` again and verify username/password |
| `database "aurora_db" does not exist` | Run the CREATE DATABASE command above |
| `could not connect to server` | PostgreSQL service not running. Open Windows Services → find PostgreSQL → Start it |

---

## Test It Works

```bash
# In PowerShell, from backend directory
python -c "from db.connection import initialize_db; initialize_db()"
```

Should print: `✅ Database connection successful`

---

## What Gets Fixed

- ❌ 400 Bad Request error → ✅ Clear error message
- ❌ Vague database errors → ✅ "Database connection unavailable"
- ❌ Silent failures → ✅ Logged on server startup

---

For more details, see: `DATABASE_SETUP.md`
