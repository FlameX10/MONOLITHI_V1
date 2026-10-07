# backend/services/geo.py

import geopandas as gpd
from shapely.geometry import Point
from config.settings import GEOGRAPHIC_CRS


def to_geodf(df):
    """
    Convert DataFrame to GeoDataFrame.
    - If geometry already exists, preserve it
    - Else, create POINT geometry from lat/lon
    """

    # Case 1️⃣: Geometry already present (e.g. violations)
    if "geometry" in df.columns:
        gdf = gpd.GeoDataFrame(df, geometry="geometry", crs=GEOGRAPHIC_CRS)
        return gdf

    # Case 2️⃣: No geometry → create from lat/lon (e.g. pixel_timeseries)
    gdf = gpd.GeoDataFrame(
        df,
        geometry=[
            Point(lon, lat)
            for lon, lat in zip(df.longitude, df.latitude)
        ],
        crs=GEOGRAPHIC_CRS
    )

    return gdf
