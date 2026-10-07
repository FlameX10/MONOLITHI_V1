# app.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.admin_routes import router as admin_router
from api.user_routes import router as user_router
from api.task_queue import router as task_router
from db.connection import initialize_db


app = FastAPI(title="Adaptive Mining Monitoring")

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    print("🚀 Starting up backend...")
    initialize_db()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change to specific domain in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router, prefix="/admin")
app.include_router(user_router, prefix="/mine")
app.include_router(task_router, prefix="/admin")  # Task endpoints at /admin/submit and /admin/status

@app.get("/health")
def health():
    return {"status": "running"}
