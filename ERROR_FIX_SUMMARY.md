# 400 Bad Request Error - Root Cause & Fixes

## Problem Summary

You were getting a **400 Bad Request** error when trying to run the admin pipeline:
```
POST http://localhost:8000/admin/run?mine_id=0&start_date=2025-01-01&end_date=2025-08-01 400 (Bad Request)
```

This happened because:
1. **PostgreSQL database connection fails** → returns `engine = None`
2. Backend tries to insert data with `engine = None` 
3. The error bubbles up as a vague 400 status code
4. No clear error message about the actual issue (database not connected)

---

## What Was Fixed

### 1. **Database Connection Management** (`backend/db/connection.py`)

**Before:**
```python
# Tried to create engine once at startup, set to None on failure
try:
    engine = create_engine(...)
except Exception as e:
    engine = None
```

**After:**
```python
# Added initialization function with test connection
def initialize_db():
    # Tests connection with: SELECT 1
    # Returns True/False to indicate success
    # Prints helpful error messages with DATABASE_URL
    
def get_engine():
    # Lazy initialization if needed
    # Returns None if connection fails
```

✅ **Benefit:** Clear error messages on startup about PostgreSQL issues

---

### 2. **Error Handling in API Route** (`backend/api/admin_routes.py`)

**Added:**
- Date format validation (YYYY-MM-DD)
- mine_id validation (non-negative)
- Proper HTTP status codes:
  - `400` - Invalid input
  - `503` - Service unavailable (database down)
  - `500` - Pipeline error

✅ **Benefit:** Better error feedback to frontend

---

### 3. **Database Write Error Handling** (`backend/services/db_write.py`)

**Before:**
```python
from db.connection import engine
# ... uses engine directly, fails silently
```

**After:**
```python
from db.connection import get_engine
engine = get_engine()
if engine is None:
    raise RuntimeError("Database connection is not available...")
```

✅ **Benefit:** Clear error message explaining what needs to be fixed

---

### 4. **Database Read Error Handling** (`backend/services/db_reader.py`)

Same pattern applied to:
- `fetch_pixels()` 
- `fetch_mine_details()`
- `fetch_mine_kpi()`

✅ **Benefit:** Fallback to CSV data if database unavailable

---

### 5. **Automatic Database Initialization** (`backend/app.py`)

**Added:**
```python
@app.on_event("startup")
def startup_event():
    initialize_db()  # Runs when server starts
```

✅ **Benefit:** Database connection tested on server startup, errors logged immediately

---

## How to Fix the PostgreSQL Connection Error

### 1. Install PostgreSQL with PostGIS
   - Follow instructions in `DATABASE_SETUP.md`

### 2. Create Database and User
   ```sql
   CREATE DATABASE aurora_db;
   CREATE USER aurora WITH PASSWORD 'aurora';
   GRANT ALL PRIVILEGES ON DATABASE aurora_db TO aurora;
   ```

### 3. Create `.env` file in `backend/` directory
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=aurora_db
   DB_USER=aurora
   DB_PASSWORD=aurora
   ```

### 4. Restart Backend Server
   ```bash
   cd backend
   python -m uvicorn app:app --reload
   ```

### 5. Check Logs
   Look for: `✅ Database connection successful`

---

## Error Messages You'll See

### Before Fixes (Unhelpful)
```
POST .../admin/run?... 400 (Bad Request)
❌ Mine 0: HTTP error! status: 400
```

### After Fixes (Helpful)
```
# On server startup:
❌ Database Connection Error: psycopg2.OperationalError: could not connect to server: Connection refused

# On admin API call (if DB not connected):
POST .../admin/run?... 503 (Service Unavailable)
❌ Mine 0: Service unavailable: Database connection is not available...
```

---

## Testing the Fix

### Step 1: Start Backend with Monitoring
```bash
cd backend
python -m uvicorn app:app --reload
```

Watch for startup message:
- ✅ `✅ Database connection successful` → All good!
- ❌ `❌ Database Connection Error: ...` → Follow troubleshooting

### Step 2: Test API Health
```bash
curl http://localhost:8000/health
# Response: {"status":"running"}
```

### Step 3: Test Admin Pipeline (if DB connected)
```bash
curl -X POST "http://localhost:8000/admin/run?mine_id=0&start_date=2025-01-01&end_date=2025-08-01"
```

---

## Files Modified

| File | Change |
|------|--------|
| `backend/db/connection.py` | Added `initialize_db()` and `get_engine()` |
| `backend/app.py` | Added startup event to initialize DB |
| `backend/api/admin_routes.py` | Added input validation and better error handling |
| `backend/services/db_write.py` | Use `get_engine()` and validate connection |
| `backend/services/db_reader.py` | Use `get_engine()` and validate connection |
| `backend/.env.example` | Created template for environment variables |

---

## New Documentation

- **`DATABASE_SETUP.md`** - Complete PostgreSQL & PostGIS setup guide
- **`backend/.env.example`** - Environment variables template

---

## Next Steps

1. ✅ Read `DATABASE_SETUP.md` and install PostgreSQL
2. ✅ Create `.env` file with your database credentials
3. ✅ Restart the backend server
4. ✅ Look for `✅ Database connection successful` in logs
5. ✅ Try the admin pipeline again

The 400 error should now give you a clear 503 error with a message explaining exactly what's wrong!
