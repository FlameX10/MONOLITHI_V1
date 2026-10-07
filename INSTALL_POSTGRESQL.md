# How to Install and Start PostgreSQL on Windows

## Step 1: Download PostgreSQL Installer

1. Go to: https://www.postgresql.org/download/windows/
2. Click **Download the installer** (v15 or v18)
3. Choose your version and run the installer

## Step 2: Run the Installer

During installation:
- **Installation Directory**: `C:\Program Files\PostgreSQL\18` (or your version)
- **Port**: Keep as `5432`
- **Superuser Password**: Set a password (e.g., `postgres`)
- **Default Locale**: English, United States
- ✅ **Important**: Check the box "Stack Builder" at the end

## Step 3: Install PostGIS Extension (via Stack Builder)

1. Stack Builder will open automatically after installation
2. Select your PostgreSQL version
3. Expand **"Spatial Extensions"**
4. Check **PostGIS** 
5. Click **Next** and complete installation

## Step 4: Start PostgreSQL Service

### Option A: PowerShell (Recommended)

```powershell
# Check service name
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Start the service (replace postgresql-x64-18 with your version)
Start-Service -Name "postgresql-x64-18"

# Verify it's running
Get-Service -Name "postgresql-x64-18" | Select-Object Status
```

### Option B: Windows Services GUI

1. Press `Win + R`
2. Type: `services.msc`
3. Find **"PostgreSQL Server"** (or postgresql-x64-18)
4. Right-click → **Start**

### Option C: Using pg_ctl (Command Line)

```powershell
# Find your PostgreSQL data directory first
dir "C:\Program Files\PostgreSQL"

# Then run (example for version 18):
"C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D "C:\Program Files\PostgreSQL\18\data" start
```

## Step 5: Verify PostgreSQL is Running

```powershell
# Test connection
psql -U postgres -h localhost

# Enter password when prompted
# Type \q to quit
```

## Step 6: Create Database and User

In PowerShell:
```powershell
psql -U postgres
```

Then paste this in psql:
```sql
CREATE DATABASE aurora_db;
\c aurora_db
CREATE EXTENSION postgis;
CREATE USER aurora WITH ENCRYPTED PASSWORD 'aurora';
GRANT ALL PRIVILEGES ON DATABASE aurora_db TO aurora;
GRANT ALL PRIVILEGES ON SCHEMA public TO aurora;
\q
```

## Step 7: Create `.env` File

Create file: `backend/.env`

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aurora_db
DB_USER=aurora
DB_PASSWORD=aurora
GEE_PROJECT=monolith-484408
```

## Step 8: Test Backend Connection

```powershell
cd backend
python -c "from db.connection import initialize_db; initialize_db()"
```

Should print: `✅ Database connection successful`

---

## Troubleshooting

### PostgreSQL Not Installed
- Download from: https://www.postgresql.org/download/windows/
- Run the installer with all steps above

### Service Not Starting
1. Open Windows Services: `services.msc`
2. Find PostgreSQL service
3. Right-click → Properties
4. Set startup type to **Automatic**
5. Right-click → Start

### Can't Find Service in PowerShell
```powershell
# List all PostgreSQL services
Get-Service | Where-Object {$_.Name -like "*postgres*"}
```
Use the exact name shown here.

### "psql: command not found"
Add to PATH:
```powershell
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"
```

### Still Getting 400 Error?
1. Verify PostgreSQL is running: `Get-Service -Name postgresql* | Select Status`
2. Verify `.env` file exists in `backend/`
3. Restart backend server: `python -m uvicorn app:app --reload`
4. Check for: `✅ Database connection successful`
