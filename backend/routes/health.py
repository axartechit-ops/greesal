import time
from fastapi import APIRouter
from backend.database import get_db

router = APIRouter(tags=["Health"])

@router.get("/health")
@router.get("/api/health")
def health_check():
    db = get_db()
    db_status = "connected" if db is not None else "disconnected (using fallback)"
    return {
        "status": "healthy",
        "service": "Greesal FastAPI Backend",
        "framework": "FastAPI",
        "timestamp": int(time.time()),
        "database": db_status
    }
