# backend/services/csv_reader.py
# Legacy fallback service - data should come from database after pipeline execution

import pandas as pd
import os
from pathlib import Path

# Get the path to the CSV file in the frontend data folder
BASE_DIR = Path(__file__).resolve().parents[2]
CSV_PATH = BASE_DIR / "frontend" / "src" / "data" / "pixel_timeseries (1).csv"

def fetch_pixels_from_csv(mine_id: int, start_date: str, end_date: str):
    """
    Legacy method: Fetch pixel-level spectral data from CSV file
    Note: This should only be used for testing. Production data comes from database after pipeline execution.
    """
    try:
        # Read the CSV file
        df = pd.read_csv(CSV_PATH)
        
        # Filter by mine_id
        df = df[df['mine_id'] == mine_id]
        
        if df.empty:
            print(f"⚠️  No data found in CSV for mine_id {mine_id}")
            print("   To view analysis data:")
            print("   1. Go to Admin Panel")
            print("   2. Select this mine")
            print("   3. Select a date range")
            print("   4. Click 'Run Pipeline'")
            print("   5. Wait for processing to complete")
            return pd.DataFrame()
        
        # Convert date column to datetime
        df['date'] = pd.to_datetime(df['date'])
        start = pd.to_datetime(start_date)
        end = pd.to_datetime(end_date)
        
        # Filter by date range
        df = df[(df['date'] >= start) & (df['date'] <= end)]
        
        # Convert date back to string for JSON serialization
        df['date'] = df['date'].dt.strftime('%Y-%m-%d')
        
        # Select relevant columns
        columns = [
            'mine_id', 'date', 'latitude', 'longitude',
            'b4', 'b8', 'b11', 'ndvi', 'nbr',
            'anomaly_label', 'anomaly_score', 'excavated_flag'
        ]
        
        available_columns = [col for col in columns if col in df.columns]
        df = df[available_columns]
        
        return df
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return pd.DataFrame()

def fetch_mine_details_from_csv(mine_id: int):
    """Fetch mine details from geojson file"""
    try:
        import json
        
        # Get mines.json from frontend
        mines_json_path = BASE_DIR / "frontend" / "src" / "data" / "mines.json"
        
        with open(mines_json_path, 'r') as f:
            geojson = json.load(f)
        
        # Find the mine in the GeoJSON
        for feature in geojson.get('features', []):
            if feature['properties'].get('mine_id') == mine_id:
                return feature
        
        return None
    except Exception as e:
        print(f"Error reading mines.json: {e}")
        return None
