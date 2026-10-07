import pandas as pd
import numpy as np
import geopandas as gpd
from sklearn.ensemble import IsolationForest
from shapely.geometry import Point


# --------------------------------------------------
# CORE ANOMALY + VIOLATION PIPELINE (REUSABLE)
# --------------------------------------------------
def run_anomaly_detection(df: pd.DataFrame):
    """
    Runs Isolation Forest based excavation detection and
    generates violation alerts.

    Parameters
    ----------
    df : pd.DataFrame
        Preprocessed pixel-wise dataframe (from preprocess.py)

    Returns
    -------
    df_anomaly : pd.DataFrame
        DataFrame with anomaly labels and excavation flags
    violations : gpd.GeoDataFrame
        Spatial intersection of excavated pixels with no-go zones
    alerts_df : pd.DataFrame
        Generated alerts summary
    """

    # -----------------------------------------
    # PHASE 1: Prepare Data
    # -----------------------------------------
    df = df.copy()
    df['date'] = pd.to_datetime(df['date'])

    FEATURES = ['B4', 'B8', 'B11', 'NDVI', 'NBR']

    results = []

    # -----------------------------------------
    # PHASE 2: Isolation Forest per mine
    # -----------------------------------------
    for mine_id, mine_df in df.groupby('mine_id'):
        X = mine_df[FEATURES].values

        model = IsolationForest(
            n_estimators=200,
            max_samples='auto',
            contamination='auto',
            random_state=42
        )

        model.fit(X)

        mine_df = mine_df.copy()
        mine_df['anomaly_label'] = model.predict(X)
        mine_df['anomaly_score'] = model.decision_function(X)

        results.append(mine_df)

    df_anomaly = pd.concat(results).reset_index(drop=True)

    # -----------------------------------------
    # PHASE 3: Temporal excavation logic
    # -----------------------------------------
    df_anomaly = df_anomaly.sort_values(
        by=['mine_id', 'latitude', 'longitude', 'date']
    )

    df_anomaly['excavated_flag'] = 0

    for (mine, lat, lon), pixel_df in df_anomaly.groupby(
        ['mine_id', 'latitude', 'longitude']
    ):
        pixel_df = pixel_df.sort_values('date')

        anomaly_runs = (
            pixel_df['anomaly_label']
            .eq(-1)
            .astype(int)
            .rolling(window=2)
            .sum()
        )

        df_anomaly.loc[pixel_df.index, 'excavated_flag'] = (
            anomaly_runs >= 2
        ).astype(int)

    # -----------------------------------------
    # PHASE 4: Synthetic vegetation zone
    # -----------------------------------------
    veg_pixels = df.groupby(
        ['latitude', 'longitude']
    )['NDVI'].mean().reset_index()

    veg_pixels = veg_pixels[
        veg_pixels['NDVI'] > veg_pixels['NDVI'].quantile(0.9)
    ]

    veg_gdf = gpd.GeoDataFrame(
        veg_pixels,
        geometry=gpd.points_from_xy(
            veg_pixels.longitude,
            veg_pixels.latitude
        ),
        crs="EPSG:4326"
    )

    # Convert to projected CRS for accurate buffer operation
    veg_gdf_projected = veg_gdf.to_crs("EPSG:3857")
    veg_polygon = veg_gdf_projected.buffer(0.0005).unary_union.simplify(0.00001)
    # Convert back to geographic CRS
    veg_polygon = gpd.GeoSeries([veg_polygon], crs="EPSG:3857").to_crs("EPSG:4326")[0]

    veg_zone = gpd.GeoDataFrame(
        {'zone_type': ['Synthetic Forest Protection Zone']},
        geometry=[veg_polygon],
        crs="EPSG:4326"
    )

    # -----------------------------------------
    # PHASE 5: Synthetic water zone
    # -----------------------------------------
    water_pixels = df.groupby(
        ['latitude', 'longitude']
    )[['B8', 'B11']].mean().reset_index()

    water_pixels = water_pixels[
        (water_pixels['B8'] < water_pixels['B8'].quantile(0.1)) &
        (water_pixels['B11'] < water_pixels['B11'].quantile(0.1))
    ]

    water_gdf = gpd.GeoDataFrame(
        water_pixels,
        geometry=gpd.points_from_xy(
            water_pixels.longitude,
            water_pixels.latitude
        ),
        crs="EPSG:4326"
    )

    # Convert to projected CRS for accurate buffer operation
    water_gdf_projected = water_gdf.to_crs("EPSG:3857")
    water_polygon = water_gdf_projected.buffer(0.0005).unary_union.simplify(0.00001)
    # Convert back to geographic CRS
    water_polygon = gpd.GeoSeries([water_polygon], crs="EPSG:3857").to_crs("EPSG:4326")[0]

    water_zone = gpd.GeoDataFrame(
        {'zone_type': ['Synthetic Water Protection Zone']},
        geometry=[water_polygon],
        crs="EPSG:4326"
    )

    # -----------------------------------------
    # PHASE 6: Violation detection
    # -----------------------------------------
    no_go_zones = pd.concat([veg_zone, water_zone])

    df_excavated = df_anomaly[df_anomaly['excavated_flag'] == 1]

    excavated_gdf = gpd.GeoDataFrame(
        df_excavated,
        geometry=gpd.points_from_xy(
            df_excavated.longitude,
            df_excavated.latitude
        ),
        crs="EPSG:4326"
    )

    violations = gpd.overlay(
        excavated_gdf,
        no_go_zones,
        how='intersection'
    )

    violations['pixel_area'] = 10 * 10

    # -----------------------------------------
    # PHASE 7: Alert generation
    # -----------------------------------------
    alerts = []

    for (mine, zone), vdf in violations.groupby(['mine_id', 'zone_type']):
        area_by_date = vdf.groupby('date')['pixel_area'].sum()

        prev = 0
        streak = 0

        for date, area in area_by_date.items():
            if area > 0 and prev == 0:
                alert_type = "First Violation"
                streak = 1
            elif area > prev:
                alert_type = "Expansion Violation"
                streak += 1
            elif area > 0:
                alert_type = "Persistent Violation"
                streak += 1
            else:
                continue

            alerts.append({
                'mine_id': mine,
                'date': date,
                'zone_type': zone,
                'alert_type': alert_type,
                'affected_area': area
            })

            prev = area

    alerts_df = pd.DataFrame(alerts)

    return df_anomaly, violations, alerts_df
