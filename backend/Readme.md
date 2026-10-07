# Adaptive Mining Activity Monitoring – Backend

This backend implements the data ingestion, processing, storage, and querying pipeline for the Adaptive Mining Activity Monitoring System using satellite imagery and geospatial analytics.

---

## Backend Responsibilities

- Fetch Sentinel-2 satellite data from Google Earth Engine
- Sample pixel-wise time-series data at fixed 21-day intervals
- Run anomaly detection to identify excavation activity
- Store processed pixel data in PostgreSQL + PostGIS
- Serve fast read-only APIs for visualization and analysis
- Prevent duplicate computation and duplicate database inserts

---

## Backend Architecture

There are two strictly separated workflows:

### 1. Admin Workflow (Heavy, Controlled)

- Used only for ingestion and processing
- Fetches data from Google Earth Engine
- Runs preprocessing and ML algorithms
- Stores results in the database
- Smart range handling (no recomputation)

### 2. User Workflow (Lightweight, Fast)

- Reads precomputed data from database
- No Earth Engine calls
- No ML execution
- Suitable for dashboards and visualization

---

## File Structure

## File Structure

```text
backend/
├── app.py
├── api/
│   ├── admin_routes.py
│   └── user_routes.py
├── algorithms/
│   ├── data_script.py          # GEE data extraction (21-day interval)
│   ├── preprocess.py           # Feature preprocessing
│   └── model.py                # Anomaly detection logic
├── processing/
│   └── admin_processor.py      # Range-aware admin pipeline
├── services/
│   ├── db_reader.py            # User queries + admin range checks
│   ├── db_write.py             # Database insertion
│   ├── normalize.py            # Schema normalization
│   └── geo.py                  # Geometry creation
├── db/
│   └── schema.sql              # PostgreSQL + PostGIS schema
├── config/
│   └── settings.py             # GEE & DB configuration
├── data/
│   └── mines_cil_polygon/
│       └── mines_cils.shp
└── requirements.txt

```

---

## Technology Stack

- FastAPI
- PostgreSQL
- PostGIS
- Google Earth Engine
- GeoPandas
- scikit-learn
- SQLAlchemy

---

## System Requirements

- Python 3.10+
- PostgreSQL 14+
- PostGIS 3+
- Internet connection (for Google Earth Engine)

---

## PostgreSQL & PostGIS Setup

### Install PostgreSQL

Download from:
https://www.postgresql.org/download/

---

### Create Database and User

Open `psql` and run:

CREATE DATABASE aurora_db;

CREATE USER aurora WITH PASSWORD 'aurora';

GRANT ALL PRIVILEGES ON DATABASE aurora_db TO aurora;


Password is intentionally set to **aurora** for judge convenience.

---

### Enable PostGIS

\c aurora_db
CREATE EXTENSION postgis;


---

### Create Database Schema

From project root:

psql -U aurora -d aurora_db -f backend/db/schema.sql


---

## Google Earth Engine Setup

### Create GEE Account

https://earthengine.google.com/

---

### Enable Earth Engine API

- Create a Google Cloud Project
- Enable Earth Engine API
- Copy the project ID

---

### Authenticate Locally

earthengine authenticate


A browser window will open for authorization.

---

## Backend Configuration

Edit `backend/config/settings.py`:

GEE_PROJECT = "your-gee-project-id"

SHAPEFILE_PATH = "backend/data/mines_cil_polygon/mines_cils.shp"

DB_URL = "postgresql://aurora:aurora@localhost:5432/aurora_db"


---

## Python Environment Setup

python -m venv venv


Activate:

venv\Scripts\activate # Windows
source venv/bin/activate # Linux / Mac


Install dependencies:

pip install -r requirements.txt


---

## Running the Backend

Default port: **8000**

uvicorn backend.app:app --reload


Open:

- API Docs: http://127.0.0.1:8000/docs
- Health Check: http://127.0.0.1:8000/health

---


