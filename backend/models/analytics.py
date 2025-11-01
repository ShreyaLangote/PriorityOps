# backend/models/analytics.py
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime
from .ticket import Priority, Status

class TicketStats(BaseModel):
    """Overall ticket statistics model"""
    total_tickets: int = Field(..., ge=0, description="Total number of tickets")
    open_tickets: int = Field(..., ge=0, description="Number of open tickets")
    in_progress_tickets: int = Field(..., ge=0, description="Number of in-progress tickets")
    resolved_tickets: int = Field(..., ge=0, description="Number of resolved tickets")
    closed_tickets: int = Field(..., ge=0, description="Number of closed tickets")
    escalated_tickets: int = Field(..., ge=0, description="Number of escalated tickets")
    
    # Priority distribution
    critical_tickets: int = Field(..., ge=0, description="Number of critical priority tickets")
    high_tickets: int = Field(..., ge=0, description="Number of high priority tickets")
    medium_tickets: int = Field(..., ge=0, description="Number of medium priority tickets")
    low_tickets: int = Field(..., ge=0, description="Number of low priority tickets")
    
    # Performance metrics
    avg_resolution_time_hours: Optional[float] = Field(None, ge=0, description="Average resolution time in hours")
    avg_response_time_hours: Optional[float] = Field(None, ge=0, description="Average response time in hours")
    
    generated_at: datetime = Field(default_factory=datetime.utcnow, description="When these stats were generated")

class PriorityDistribution(BaseModel):
    """Priority distribution statistics"""
    priority: Priority = Field(..., description="Priority level")
    count: int = Field(..., ge=0, description="Number of tickets with this priority")
    percentage: float = Field(..., ge=0, le=100, description="Percentage of total tickets")

class TrendDataPoint(BaseModel):
    """Single data point for trend analysis"""
    date: datetime = Field(..., description="Date for this data point")
    created_count: int = Field(..., ge=0, description="Number of tickets created on this date")
    resolved_count: int = Field(..., ge=0, description="Number of tickets resolved on this date")
    open_count: int = Field(..., ge=0, description="Number of tickets open at end of this date")

class TrendData(BaseModel):
    """Time-based trend analysis data"""
    period_start: datetime = Field(..., description="Start of the analysis period")
    period_end: datetime = Field(..., description="End of the analysis period")
    data_points: List[TrendDataPoint] = Field(..., description="List of trend data points")
    total_created: int = Field(..., ge=0, description="Total tickets created in period")
    total_resolved: int = Field(..., ge=0, description="Total tickets resolved in period")
    net_change: int = Field(..., description="Net change in open tickets (created - resolved)")

class PerformanceMetrics(BaseModel):
    """Performance analysis metrics"""
    avg_resolution_time_hours: Optional[float] = Field(None, ge=0, description="Average time to resolve tickets in hours")
    median_resolution_time_hours: Optional[float] = Field(None, ge=0, description="Median time to resolve tickets in hours")
    avg_first_response_time_hours: Optional[float] = Field(None, ge=0, description="Average time to first response in hours")
    
    # Resolution time by priority
    critical_avg_resolution_hours: Optional[float] = Field(None, ge=0)
    high_avg_resolution_hours: Optional[float] = Field(None, ge=0)
    medium_avg_resolution_hours: Optional[float] = Field(None, ge=0)
    low_avg_resolution_hours: Optional[float] = Field(None, ge=0)
    
    # SLA compliance (assuming 1 hour for critical, 4 hours for high, etc.)
    sla_compliance_rate: Optional[float] = Field(None, ge=0, le=100, description="Percentage of tickets meeting SLA")
    overdue_tickets: int = Field(..., ge=0, description="Number of tickets past their SLA")
    
    analysis_period_start: datetime = Field(..., description="Start of analysis period")
    analysis_period_end: datetime = Field(..., description="End of analysis period")

class DepartmentStats(BaseModel):
    """Statistics by department"""
    department: str = Field(..., description="Department name")
    total_tickets: int = Field(..., ge=0, description="Total tickets for this department")
    open_tickets: int = Field(..., ge=0, description="Open tickets for this department")
    avg_resolution_time_hours: Optional[float] = Field(None, ge=0, description="Average resolution time for this department")
    priority_distribution: List[PriorityDistribution] = Field(..., description="Priority distribution for this department")