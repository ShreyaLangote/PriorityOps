# server.py
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from backend.config.settings import settings
from backend.routes import tickets, analytics
from backend.utils.database import connect_to_mongo, close_mongo_connection
from mangum import Mangum

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events."""
    # Startup
    logger.info("Starting PriorityOps Backend...")
    await connect_to_mongo()
    logger.info("Database connection established")
    
    yield
    
    # Shutdown
    logger.info("Shutting down PriorityOps Backend...")
    await close_mongo_connection()
    logger.info("Database connection closed")


# Initialize FastAPI app with lifespan manager
app = FastAPI(
    title="PriorityOps Backend",
    description="AI-powered ticket management and prioritization system",
    version=settings.api_version,
    lifespan=lifespan
)

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list if settings.is_production else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tickets.router, prefix="/api/v1", tags=["tickets"])
app.include_router(analytics.router, prefix="/api/v1", tags=["analytics"])


@app.get("/")
async def root():
    """Root endpoint for health check."""
    return {
        "message": "PriorityOps FastAPI is live ✅",
        "version": settings.api_version,
        "environment": settings.environment
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "PriorityOps Backend",
        "version": settings.api_version,
        "environment": settings.environment
    }


# Lambda handler for AWS deployment
handler = Mangum(app)
