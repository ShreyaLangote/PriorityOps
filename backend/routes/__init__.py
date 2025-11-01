"""
API routes package for PriorityOps system.

This package contains FastAPI routers for:
- Ticket management endpoints
- Analytics endpoints
- Agent management endpoints
"""

from . import tickets, analytics

__all__ = ["tickets", "analytics"]