"""
Analytics service for generating ticket statistics and insights.

This module contains the business logic for analytics operations.
"""

from typing import Dict, List, Any
from datetime import datetime, timedelta
from collections import defaultdict

from backend.models.analytics import TicketStats, TrendData, PriorityDistribution, PerformanceMetrics
from backend.models.ticket import Priority, Status
from backend.utils.database import get_database


class AnalyticsService:
    """Service class for analytics operations."""
    
    def __init__(self):
        self.collection_name = "tickets"
    
    async def get_ticket_summary(self) -> TicketStats:
        """Get overall ticket statistics."""
        db = await get_database()
        collection = db[self.collection_name]
        
        # Aggregate statistics
        pipeline = [
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "open": {
                        "$sum": {
                            "$cond": [
                                {"$in": ["$status", ["open", "in_progress"]]},
                                1,
                                0
                            ]
                        }
                    },
                    "closed": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$status", "closed"]},
                                1,
                                0
                            ]
                        }
                    },
                    "high_priority": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$priority", "high"]},
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]
        
        result = await collection.aggregate(pipeline).to_list(1)
        
        if not result:
            return TicketStats(
                total_tickets=0,
                open_tickets=0,
                closed_tickets=0,
                high_priority_tickets=0
            )
        
        stats = result[0]
        return TicketStats(
            total_tickets=stats.get("total", 0),
            open_tickets=stats.get("open", 0),
            closed_tickets=stats.get("closed", 0),
            high_priority_tickets=stats.get("high_priority", 0)
        )
    
    async def get_priority_distribution(self) -> List[PriorityDistribution]:
        """Get distribution of tickets by priority."""
        db = await get_database()
        collection = db[self.collection_name]
        
        pipeline = [
            {
                "$group": {
                    "_id": "$priority",
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id": 1}
            }
        ]
        
        results = await collection.aggregate(pipeline).to_list(None)
        
        # Ensure all priorities are represented
        priority_counts = {p.value: 0 for p in Priority}
        for result in results:
            priority_counts[result["_id"]] = result["count"]
        
        return [
            PriorityDistribution(priority=priority, count=count)
            for priority, count in priority_counts.items()
        ]
    
    async def get_trend_data(self, days: int = 30) -> List[TrendData]:
        """Get trend data for the specified number of days."""
        db = await get_database()
        collection = db[self.collection_name]
        
        # Calculate date range
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": start_date, "$lte": end_date}
                }
            },
            {
                "$group": {
                    "_id": {
                        "$dateToString": {
                            "format": "%Y-%m-%d",
                            "date": "$created_at"
                        }
                    },
                    "created": {"$sum": 1},
                    "closed": {
                        "$sum": {
                            "$cond": [
                                {"$eq": ["$status", "closed"]},
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                "$sort": {"_id": 1}
            }
        ]
        
        results = await collection.aggregate(pipeline).to_list(None)
        
        # Fill in missing dates with zero counts
        trend_data = []
        current_date = start_date
        result_dict = {r["_id"]: r for r in results}
        
        while current_date <= end_date:
            date_str = current_date.strftime("%Y-%m-%d")
            result = result_dict.get(date_str, {"created": 0, "closed": 0})
            
            trend_data.append(TrendData(
                date=current_date.date(),
                tickets_created=result["created"],
                tickets_closed=result["closed"]
            ))
            
            current_date += timedelta(days=1)
        
        return trend_data
    
    async def get_performance_metrics(self) -> PerformanceMetrics:
        """Get performance metrics for ticket resolution."""
        db = await get_database()
        collection = db[self.collection_name]
        
        # Calculate average resolution time for closed tickets
        pipeline = [
            {
                "$match": {
                    "status": "closed",
                    "closed_at": {"$exists": True}
                }
            },
            {
                "$addFields": {
                    "resolution_time_hours": {
                        "$divide": [
                            {"$subtract": ["$closed_at", "$created_at"]},
                            1000 * 60 * 60  # Convert milliseconds to hours
                        ]
                    }
                }
            },
            {
                "$group": {
                    "_id": None,
                    "avg_resolution_time": {"$avg": "$resolution_time_hours"},
                    "min_resolution_time": {"$min": "$resolution_time_hours"},
                    "max_resolution_time": {"$max": "$resolution_time_hours"},
                    "total_resolved": {"$sum": 1}
                }
            }
        ]
        
        result = await collection.aggregate(pipeline).to_list(1)
        
        if not result:
            return PerformanceMetrics(
                avg_resolution_time_hours=0.0,
                total_resolved_tickets=0,
                resolution_rate_percent=0.0
            )
        
        metrics = result[0]
        
        # Calculate resolution rate
        total_tickets = await collection.count_documents({})
        resolution_rate = (metrics["total_resolved"] / total_tickets * 100) if total_tickets > 0 else 0.0
        
        return PerformanceMetrics(
            avg_resolution_time_hours=round(metrics.get("avg_resolution_time", 0.0), 2),
            total_resolved_tickets=metrics.get("total_resolved", 0),
            resolution_rate_percent=round(resolution_rate, 2)
        )


# Global service instance
analytics_service = AnalyticsService()