# backend/api/user_routes.py

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from services.db_reader import fetch_pixels, fetch_mine_details, fetch_mine_kpi, get_violation_statistics, get_excavation_compliance
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/pixels")
def get_pixels(mine_id: str, start: str = None, end: str = None):
    """Fetch pixel-level spectral data for a mine"""
    try:
        # Convert mine_id to int
        try:
            mine_id = int(mine_id)
        except ValueError:
            return JSONResponse({"error": "Invalid mine_id"}, status_code=400)
        
        if not start:
            start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        if not end:
            end = datetime.now().strftime("%Y-%m-%d")
        
        df = fetch_pixels(mine_id, start, end)
        
        # Always return array directly for frontend compatibility
        if df.empty:
            return []
        
        return df.to_dict(orient="records")
    except Exception as e:
        print(f"Error in get_pixels: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get("/details/{mine_id}")
def get_mine_details(mine_id: int):
    """Fetch mine details including geometry and properties"""
    try:
        details = fetch_mine_details(mine_id)
        if details is None:
            return JSONResponse({"error": f"Mine {mine_id} not found"}, status_code=404)
        return details
    except Exception as e:
        print(f"Error in get_mine_details: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get("/kpi/{mine_id}")
def get_mine_kpi(mine_id: int, start: str = None, end: str = None):
    """Fetch KPI metrics for a mine"""
    try:
        if not start:
            start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        if not end:
            end = datetime.now().strftime("%Y-%m-%d")
        
        return fetch_mine_kpi(mine_id, start, end)
    except Exception as e:
        print(f"Error in get_mine_kpi: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get("/spectral-signature/{mine_id}")
def get_spectral_signature(mine_id: int, start: str = None, end: str = None):
    """Fetch aggregated spectral data for radar chart"""
    try:
        if not start:
            start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        if not end:
            end = datetime.now().strftime("%Y-%m-%d")
        
        df = fetch_pixels(mine_id, start, end)
        if df.empty:
            return {"normal": {}, "anomalous": {}}
        
        # Separate normal and anomalous pixels
        normal = df[df['anomaly_label'] == -1]
        anomalous = df[df['anomaly_label'] == 1]
        
        # Compute mean values
        bands = ['b4', 'b8', 'b11', 'ndvi', 'nbr']
        
        result = {
            "normal": {band: float(normal[band].mean()) if len(normal) > 0 else 0 for band in bands},
            "anomalous": {band: float(anomalous[band].mean()) if len(anomalous) > 0 else 0 for band in bands}
        }
        
        return result
    except Exception as e:
        print(f"Error in get_spectral_signature: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get("/violations/{mine_id}")
def get_violations(mine_id: int, start: str = None, end: str = None):
    """Fetch violation statistics for a mine"""
    try:
        if not start:
            start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        if not end:
            end = datetime.now().strftime("%Y-%m-%d")
        
        return get_violation_statistics(mine_id, start, end)
    except Exception as e:
        print(f"Error in get_violations: {e}")
        return JSONResponse({"error": str(e)}, status_code=500)

@router.get("/compliance/{mine_id}")
def get_compliance(mine_id: int, start: str = None, end: str = None):
    """Fetch excavation compliance data for a mine"""
    try:
        if not start:
            start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        if not end:
            end = datetime.now().strftime("%Y-%m-%d")
        
        return get_excavation_compliance(mine_id, start, end)
    except Exception as e:
        print(f"Error in get_compliance: {e}")
