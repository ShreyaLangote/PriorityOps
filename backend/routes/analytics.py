from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging

from backend.services.analytics_service import analytics_service
from backend.models.analytics import TicketStats, TrendData, PriorityDistribution, PerformanceMetrics

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/summary", response_model=TicketStats)
async def get_analytics_summary():
    """Get overall ticket statistics summary."""
    try:
        return await analytics_service.get_ticket_summary()
    except Exception as e:
        logger.error(f"Error getting analytics summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get analytics summary")

@router.get("/priority", response_model=list[PriorityDistribution])
async def get_priority_distribution():
    """Get distribution of tickets by priority level."""
    try:
        return await analytics_service.get_priority_distribution()
    except Exception as e:
        logger.error(f"Error getting priority distribution: {e}")
        raise HTTPException(status_code=500, detail="Failed to get priority distribution")

@router.get("/trends", response_model=list[TrendData])
async def get_trend_data(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze")
):
    """Get trend data for ticket creation and resolution over time."""
    try:
        return await analytics_service.get_trend_data(days=days)
    except Exception as e:
        logger.error(f"Error getting trend data: {e}")
        raise HTTPException(status_code=500, detail="Failed to get trend data")

@router.get("/performance", response_model=PerformanceMetrics)
async def get_performance_metrics():
    """Get performance metrics for ticket resolution."""
    try:
        return await analytics_service.get_performance_metrics()
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get performance metrics")
