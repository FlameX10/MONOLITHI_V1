# backend/processing/admin_processor.py

from datetime import timedelta
import pandas as pd

from algorithms.data_script import fetch_mine_pixel_timeseries_df
from algorithms.preprocess import preprocess_pixel_timeseries
from algorithms.model import run_anomaly_detection
from services.normalize import normalize_df, normalize_alerts
from services.geo import to_geodf
from services.db_write import (
    insert_pixels,
    insert_violations,
    insert_alerts
)
from services.db_reader import fetch_existing_date_range
from config.settings import GEE_PROJECT, SHAPEFILE_PATH


def _compute_missing_ranges(
    requested_start,
    requested_end,
    existing_start,
    existing_end,
    min_window_days=21
):
    """
    Compute missing ranges but NEVER return ranges
    smaller than min_window_days.
    """

    print("\n[DEBUG] Computing missing ranges")
    print(f"[DEBUG] Requested: {requested_start} → {requested_end}")
    print(f"[DEBUG] Existing : {existing_start} → {existing_end}")

    ranges = []

    if requested_start > requested_end:
        return []

    if existing_start is None or existing_end is None:
        total_days = (requested_end - requested_start).days + 1
        if total_days < min_window_days:
            print("[DEBUG] Requested range too small → skipping GEE fetch")
            return []
        return [(requested_start, requested_end)]

    if requested_start >= existing_start and requested_end <= existing_end:
        return []

    if requested_start < existing_start:
        left_start = requested_start
        left_end = existing_start - timedelta(days=1)

        if (left_end - left_start).days + 1 >= min_window_days:
            print(f"[DEBUG] Left gap accepted: {left_start} → {left_end}")
            ranges.append((left_start, left_end))

    if requested_end > existing_end:
        right_start = existing_end + timedelta(days=1)
        right_end = requested_end

        if (right_end - right_start).days + 1 >= min_window_days:
            print(f"[DEBUG] Right gap accepted: {right_start} → {right_end}")
            ranges.append((right_start, right_end))

    print(f"[DEBUG] Final missing ranges: {ranges}")
    return ranges


def run_admin_pipeline(
    mine_id: int,
    start_date: str,
    end_date: str,
    progress_callback=None
):
    """
    Admin ingestion pipeline with range-awareness.
    
    Args:
        mine_id: The mine ID to process
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format
        progress_callback: Optional callback function to report progress (progress_pct, message)
    """
    
    def update_progress(pct, msg=""):
        """Helper to call progress callback if provided"""
        if progress_callback:
            progress_callback(pct, msg)
    
    print("\n================ ADMIN PIPELINE START ================")
    print(f"[DEBUG] Mine ID   : {mine_id}")
    print(f"[DEBUG] Date range: {start_date} → {end_date}")
    update_progress(5, "Validating date range...")

    existing_start, existing_end = fetch_existing_date_range(mine_id)

    req_start = pd.to_datetime(start_date).date()
    req_end = pd.to_datetime(end_date).date()

    missing_ranges = _compute_missing_ranges(
        req_start,
        req_end,
        existing_start,
        existing_end
    )

    if not missing_ranges:
        print("[DEBUG] No missing ranges → pipeline skipped")
        update_progress(100, "No new data to process")
        return {
            "status": "skipped",
            "mine_id": mine_id,
            "reason": "Requested date range already exists in database",
            "existing_range": {
                "start": str(existing_start),
                "end": str(existing_end)
            }
        }

    total_pixels = 0
    total_violations = 0
    total_alerts = 0

    for idx, (range_start, range_end) in enumerate(missing_ranges):

        print(f"\n[DEBUG] Processing range {range_start} → {range_end}")
        update_progress(15 + (idx * 70 // len(missing_ranges)), f"Fetching satellite data for {range_start} to {range_end}...")

        df_raw = fetch_mine_pixel_timeseries_df(
            gee_project=GEE_PROJECT,
            shapefile_path=SHAPEFILE_PATH,
            mine_index=mine_id,
            start_date=str(range_start),
            end_date=str(range_end)
        )

        if df_raw.empty:
            print(f"[DEBUG] No data fetched for range {range_start} → {range_end}")
            continue

        update_progress(25 + (idx * 70 // len(missing_ranges)), "Preprocessing pixel data...")
        _, _, df_scaled = preprocess_pixel_timeseries(df_raw)

        # 🔥 Capture all outputs
        update_progress(40 + (idx * 70 // len(missing_ranges)), "Running anomaly detection...")
        df_anomaly, violations, alerts_df = run_anomaly_detection(df_scaled)

        # -------------------------------
        # 1️⃣ Store pixel anomaly data
        # -------------------------------
        update_progress(55 + (idx * 70 // len(missing_ranges)), "Storing pixel data...")
        df_clean = normalize_df(df_anomaly, mine_id)

        # 🔑 REMOVE DUPLICATES (matches uq_pixel_unique)
        df_clean = df_clean.drop_duplicates(
            subset=["mine_id", "date", "latitude", "longitude"]
        )

        gdf_pixels = to_geodf(df_clean)
        insert_pixels(gdf_pixels)
        total_pixels += len(gdf_pixels)

        # -------------------------------
        # 2️⃣ Store violation pixels
        # -------------------------------
        update_progress(70 + (idx * 70 // len(missing_ranges)), "Storing violation data...")
        if not violations.empty:
            violations_clean = normalize_df(violations, mine_id)

            # 🔑 REMOVE DUPLICATES (matches uq_violation_pixel_unique)
            violations_clean = violations_clean.drop_duplicates(
                subset=["mine_id", "date", "latitude", "longitude", "zone_type"]
            )

            gdf_violations = to_geodf(violations_clean)
            insert_violations(gdf_violations)
            total_violations += len(gdf_violations)

        # -------------------------------
        # 3️⃣ Store alerts
        # -------------------------------
        update_progress(85 + (idx * 70 // len(missing_ranges)), "Storing alerts...")
        if not alerts_df.empty:
            alerts_clean = normalize_alerts(alerts_df, mine_id)
            insert_alerts(alerts_clean)
            total_alerts += len(alerts_clean)

    print("\n================ ADMIN PIPELINE END =================")
    print(
        f"[DEBUG] Pixels: {total_pixels}, "
        f"Violations: {total_violations}, "
        f"Alerts: {total_alerts}"
    )

    update_progress(100, "Pipeline completed successfully!")

    return {
        "status": "success",
        "mine_id": mine_id,
        "pixels_inserted": total_pixels,
        "violations_inserted": total_violations,
        "alerts_inserted": total_alerts,
        "processed_ranges": [
            {"start": str(s), "end": str(e)}
            for s, e in missing_ranges
        ]
    }
