from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from config.settings import settings
from database.mongo import db_instance
from routes import upload, predict, analytics, stream, research

# Setup Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0", description="Production-ready EEG Attention Monitoring Pipeline")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup and Shutdown events
@app.on_event("startup")
async def startup_db_client():
    await db_instance.connect_db()
    logger.info("Backend services fully initialized.")

@app.on_event("shutdown")
async def shutdown_db_client():
    await db_instance.close_db()

# Health Check
@app.get("/health", tags=["System"])
async def health_check():
    """Returns the operational status of the neuroscience backend."""
    return {"status": "ok", "service": settings.PROJECT_NAME, "db_connected": db_instance.client is not None}

# Include routers
app.include_router(upload.router, prefix="/api/v1", tags=["Data Ingestion"])
app.include_router(predict.router, prefix="/api/v1", tags=["Inference"])
app.include_router(analytics.router, prefix="/api/v1", tags=["Analytics"])
app.include_router(stream.router, prefix="/api/v1", tags=["Real-Time Streaming"])
app.include_router(research.router, prefix="/api/v1/research", tags=["Research Engine"])
