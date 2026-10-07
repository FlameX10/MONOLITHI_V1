# backend/config/settings.py

import os
from pathlib import Path

# ----------------------------------
# Google Earth Engine Configuration
# ----------------------------------
GEE_PROJECT = os.getenv(
    "GEE_PROJECT",
    "monolith-484408"   # default for local dev
)

# ----------------------------------
# Shapefile Configuration
# ----------------------------------

BASE_DIR = Path(__file__).resolve().parents[2]

SHAPEFILE_PATH = os.getenv(
    "SHAPEFILE_PATH",
    str(BASE_DIR / "backend" / "data" / "mines_cil_polygon" / "mines_cils.shp")
)

# ----------------------------------
# Database Configuration
# ----------------------------------
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "aurora_db")
DB_USER = os.getenv("DB_USER", "aurora")
DB_PASSWORD = os.getenv("DB_PASSWORD", "aurora")

DATABASE_URL = (
    f"postgresql://{DB_USER}:{DB_PASSWORD}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

GEOGRAPHIC_CRS = "EPSG:4326"
