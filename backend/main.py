import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from backend.config import FRONTEND_URL, PORT
from backend.database import connect_to_mongo, close_mongo_connection
from backend.routes import (
    health_router,
    salads_router,
    orders_router,
    reviews_router,
    settings_router,
    auth_router,
    location_router,
    users_router,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("greesal")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Greesal FastAPI Backend...")
    connect_to_mongo()
    yield
    logger.info("Shutting down Greesal FastAPI Backend...")
    close_mongo_connection()

def create_app() -> FastAPI:
    app = FastAPI(
        title="Greesal FastAPI Backend",
        version="2.0.0",
        description="Full Python FastAPI backend for Greesal Farm-Fresh Organic Salads & Superbowls",
        lifespan=lifespan
    )

    # Enable CORS
    origins = [
        FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    # Filter out empty or duplicate origins
    cors_origins = list(set([o.strip() for o in origins if o and o.strip()]))

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register Routers
    app.include_router(health_router)
    app.include_router(salads_router)
    app.include_router(orders_router)
    app.include_router(reviews_router)
    app.include_router(settings_router)
    app.include_router(auth_router)
    app.include_router(location_router)
    app.include_router(users_router)

    @app.get("/")
    def index():
        return {
            "app": "Greesal FastAPI Backend API",
            "status": "online",
            "framework": "FastAPI",
            "docs": "/docs",
            "endpoints": [
                "/health",
                "/api/health",
                "/salads",
                "/api/salads",
                "/admin/salads",
                "/api/admin/salads",
                "/orders",
                "/api/orders",
                "/admin/orders",
                "/api/admin/orders",
                "/reviews",
                "/api/reviews",
                "/admin/reviews",
                "/api/admin/reviews",
                "/settings",
                "/api/settings",
                "/admin/settings",
                "/api/admin/settings",
                "/auth/send-otp",
                "/api/auth/send-otp",
                "/auth/login-verify",
                "/api/auth/login-verify",
                "/auth/register",
                "/api/auth/register",
                "/admin/auth",
                "/api/admin/auth",
                "/location/check-delivery",
                "/api/location/check-delivery",
                "/location/reverse-geocode",
                "/api/location/reverse-geocode",
                "/users/sync-google",
                "/api/users/sync-google"
            ]
        }

    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting Greesal FastAPI server on port {PORT}...")
    uvicorn.run("backend.main:app", host="0.0.0.0", port=PORT, reload=True)
