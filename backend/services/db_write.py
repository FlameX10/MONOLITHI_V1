# backend/services/db_write.py

from db.connection import engine
from geoalchemy2 import Geometry


# =====================================================
# PIXEL-LEVEL TIME SERIES
# =====================================================
def insert_pixels(gdf):
    """
    Insert pixel GeoDataFrame into PostGIS.
    """

    if gdf.empty:
        return

    # Ensure CRS
    gdf = gdf.set_crs(epsg=4326, allow_override=True)

    # Ensure geometry column name
    if gdf.geometry.name != "geometry":
        gdf = gdf.rename_geometry("geometry")

    gdf.to_postgis(
        name="pixel_timeseries",
        con=engine,
        if_exists="append",
        index=False,
        dtype={
            "geometry": Geometry("POINT", srid=4326)
        }
    )


# =====================================================
# VIOLATION PIXELS (SPATIAL)
# =====================================================
def insert_violations(gdf):
    """
    Insert excavated pixels inside no-go zones
    """

    if gdf.empty:
        return

    gdf = gdf.set_crs(epsg=4326, allow_override=True)

    if gdf.geometry.name != "geometry":
        gdf = gdf.rename_geometry("geometry")

    gdf.to_postgis(
        name="violation_pixels",
        con=engine,
        if_exists="append",
        index=False,
        dtype={
            "geometry": Geometry("POINT", srid=4326)
        }
    )


# =====================================================
# VIOLATION ALERTS (NON-SPATIAL)
# =====================================================
def insert_alerts(df):
    """
    Insert aggregated violation alerts
    """

    if df.empty:
        return

    df.to_sql(
        name="violation_alerts",
        con=engine,
        if_exists="append",
        index=False,
        method="multi"
    )
