from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging

from backend.models.ticket import (
    Ticket, TicketCreate, TicketUpdate, TicketFilter, 
    Priority, Status, AuditEntry
)
from backend.services.ticket_service import ticket_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/tickets",
    tags=["Tickets"]
)

# Response models
class TicketListResponse(BaseModel):
    tickets: List[Ticket]
    total: int
    page: int
    per_page: int
    total_pages: int

class TicketResponse(BaseModel):
    success: bool
    message: str
    ticket: Optional[Ticket] = None

# ➕ Create a ticket
@router.post("/", response_model=Ticket)
async def create_ticket(ticket_data: TicketCreate):
    """Create a new ticket with validation and event triggering"""
    try:
        created_ticket = await ticket_service.create_ticket(ticket_data)
        logger.info(f"Created ticket {created_ticket.id}: {created_ticket.title}")
        return created_ticket
        
    except Exception as e:
        logger.error(f"Error creating ticket: {e}")
        raise HTTPException(status_code=500, detail="Failed to create ticket")

# 📄 Get tickets with filtering and pagination
@router.get("/", response_model=TicketListResponse)
async def get_tickets(
    # Pagination
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    
    # Filtering
    status: Optional[Status] = Query(None, description="Filter by status"),
    priority: Optional[Priority] = Query(None, description="Filter by priority"),
    assignee: Optional[str] = Query(None, description="Filter by assignee"),
):
    """Get tickets with filtering, pagination, and sorting"""
    try:
        # Calculate pagination
        skip = (page - 1) * per_page
        
        # Get tickets and total count
        tickets = await ticket_service.get_tickets(
            skip=skip,
            limit=per_page,
            status=status,
            priority=priority,
            assignee=assignee
        )
        
        total = await ticket_service.get_ticket_count(
            status=status,
            priority=priority,
            assignee=assignee
        )
        total_pages = (total + per_page - 1) // per_page
        
        return TicketListResponse(
            tickets=tickets,
            total=total,
            page=page,
            per_page=per_page,
            total_pages=total_pages
        )
        
    except Exception as e:
        logger.error(f"Error fetching tickets: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tickets")

# 🆔 Get one ticket
@router.get("/{ticket_id}", response_model=Ticket)
async def get_ticket(ticket_id: str):
    """Get a specific ticket by ID"""
    ticket = await ticket_service.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

# ✍️ Update a ticket with audit trail
@router.put("/{ticket_id}", response_model=Ticket)
async def update_ticket(ticket_id: str, updates: TicketUpdate):
    """Update a ticket with audit trail preservation"""
    try:
        updated_ticket = await ticket_service.update_ticket(ticket_id, updates)
        
        if not updated_ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        logger.info(f"Updated ticket {ticket_id}")
        return updated_ticket
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating ticket {ticket_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update ticket")

# 🗑️ Delete a ticket with proper cleanup
@router.delete("/{ticket_id}")
async def delete_ticket(ticket_id: str):
    """Delete a ticket with proper cleanup"""
    try:
        deleted = await ticket_service.delete_ticket(ticket_id)
        
        if not deleted:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        logger.info(f"Deleted ticket {ticket_id}")
        return {"success": True, "message": "Ticket deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting ticket {ticket_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete ticket")

# 📊 Get ticket audit trail
@router.get("/{ticket_id}/audit")
async def get_ticket_audit_trail(ticket_id: str):
    """Get the audit trail for a specific ticket"""
    ticket = await ticket_service.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"audit_trail": "Feature not implemented yet"}
