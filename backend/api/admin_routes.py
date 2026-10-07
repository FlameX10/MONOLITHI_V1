# backend/api/admin_routes.py

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from processing.admin_processor import run_admin_pipeline


router = APIRouter()

@router.post("/run")
def run_pipeline(
    mine_id: int = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...)
):
    try:
        # Validate dates
        if not _is_valid_date(start_date) or not _is_valid_date(end_date):
            return JSONResponse(
                status_code=400,
                content={"error": "Invalid date format. Use YYYY-MM-DD"}
            )
        
        if mine_id < 0:
            return JSONResponse(
                status_code=400,
                content={"error": "mine_id must be a non-negative integer"}
            )
        
        result = run_admin_pipeline(
            mine_id=mine_id,
            start_date=start_date,
            end_date=end_date
        )
        return JSONResponse(
            status_code=200,
            content=result
        )
    except ValueError as e:
        print(f"Validation Error: {str(e)}")
        return JSONResponse(
            status_code=400,
            content={"error": f"Invalid input: {str(e)}"}
        )
    except RuntimeError as e:
        print(f"Runtime Error: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={"error": f"Service unavailable: {str(e)}"}
        )
    except Exception as e:
        print(f"Pipeline Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"error": f"Pipeline failed: {str(e)}"}
        )

def _is_valid_date(date_str: str) -> bool:
    """Validate date string format YYYY-MM-DD"""
    try:
        from datetime import datetime
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False
