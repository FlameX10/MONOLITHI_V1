# backend/api/task_queue.py
from fastapi import APIRouter, BackgroundTasks
from fastapi.responses import JSONResponse
from datetime import datetime
import uuid

router = APIRouter()

# Simple in-memory task store
TASKS = {}

def run_pipeline_background(task_id: str, mine_id: int, start_date: str, end_date: str):
    """Run pipeline in background with progress tracking"""
    from processing.admin_processor import run_admin_pipeline
    
    try:
        TASKS[task_id]["status"] = "processing"
        TASKS[task_id]["progress"] = 5
        
        # Pass callback to update progress
        def update_progress(progress_pct, message=""):
            TASKS[task_id]["progress"] = progress_pct
            if message:
                TASKS[task_id]["message"] = message
        
        result = run_admin_pipeline(
            mine_id=mine_id,
            start_date=start_date,
            end_date=end_date,
            progress_callback=update_progress
        )
        
        TASKS[task_id]["status"] = "completed"
        TASKS[task_id]["progress"] = 100
        TASKS[task_id]["message"] = "Completed!"
        TASKS[task_id]["result"] = result
    except Exception as e:
        TASKS[task_id]["status"] = "failed"
        TASKS[task_id]["progress"] = 0
        TASKS[task_id]["error"] = str(e)
        print(f"[ERROR] Task {task_id} failed: {e}")

@router.post("/submit")
def submit_pipeline(
    mine_id: int,
    start_date: str,
    end_date: str,
    background_tasks: BackgroundTasks
):
    """Submit pipeline task and return immediately with task ID"""
    task_id = str(uuid.uuid4())
    
    TASKS[task_id] = {
        "status": "queued",
        "mine_id": mine_id,
        "progress": 0,
        "message": "Queued for processing",
        "created_at": datetime.now().isoformat()
    }
    
    # Add background task
    background_tasks.add_task(
        run_pipeline_background,
        task_id,
        mine_id,
        start_date,
        end_date
    )
    
    return {
        "task_id": task_id,
        "status": "queued"
    }

@router.get("/status/{task_id}")
def get_task_status(task_id: str):
    """Get status of a submitted task"""
    if task_id not in TASKS:
        return JSONResponse(
            {"error": "Task not found"},
            status_code=404
        )
    
    task = TASKS[task_id]
    return {
        "task_id": task_id,
        "status": task["status"],
        "progress": task.get("progress", 0),
        "message": task.get("message", ""),
        "result": task.get("result"),
        "error": task.get("error")
    }
