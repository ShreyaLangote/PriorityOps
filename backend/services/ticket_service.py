"""
Ticket service for business logic operations.

This module contains the business logic for ticket operations,
separate from the API route handlers.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId

from backend.models.ticket import Ticket, TicketCreate, TicketUpdate, Priority, Status, EventTypes
# --- CHANGE: Import the correct event function ---
from backend.utils.database import get_database
from backend.utils.events import fire_event  # <-- This is our new boto3-based function


class TicketService:
    """Service class for ticket operations."""
    
    def __init__(self):
        self.collection_name = "tickets"
    
    async def create_ticket(self, ticket_data: TicketCreate) -> Ticket:
        """Create a new ticket."""
        db = await get_database()
        collection = db[self.collection_name]
        
        # --- CHANGE: Use .model_dump() instead of .dict() ---
        ticket_dict = ticket_data.model_dump()
        ticket_dict["created_at"] = datetime.utcnow()
        ticket_dict["updated_at"] = datetime.utcnow()
        # Add default values for a new ticket
        ticket_dict["status"] = Status.PENDING
        ticket_dict["priority"] = Priority.MEDIUM # Default, AI will change this
        
        # Insert into database
        result = await collection.insert_one(ticket_dict)
        
        # Retrieve the created ticket
        created_ticket = await collection.find_one({"_id": result.inserted_id})
        ticket = Ticket(**created_ticket, id=str(created_ticket["_id"]))
        
        # --- CHANGE: Use fire_event and simplify the payload ---
        # The AI pipeline only needs the ID. It can fetch the rest.
        fire_event(
            EventTypes.TICKET_CREATED,  # "ticket.created"
            {"ticket_id": ticket.id}
        )
        
        return ticket
    
    async def get_ticket(self, ticket_id: str) -> Optional[Ticket]:
        """Get a ticket by ID."""
        db = await get_database()
        collection = db[self.collection_name]
        
        try:
            obj_id = ObjectId(ticket_id)
        except Exception:
            return None # Invalid ID format
            
        ticket_doc = await collection.find_one({"_id": obj_id})
        if not ticket_doc:
            return None
        
        return Ticket(**ticket_doc, id=str(ticket_doc["_id"]))
    
    async def get_tickets(
        self,
        skip: int = 0,
        limit: int = 100,
        status: Optional[Status] = None,
        priority: Optional[Priority] = None,
        assignee: Optional[str] = None
    ) -> List[Ticket]:
        """Get tickets with optional filtering."""
        db = await get_database()
        collection = db[self.collection_name]
        
        # Build filter query
        filter_query = {}
        if status:
            filter_query["status"] = status
        if priority:
            filter_query["priority"] = priority
        if assignee:
            filter_query["assignee"] = assignee
        
        # Execute query
        cursor = collection.find(filter_query).skip(skip).limit(limit).sort("created_at", -1)
        tickets = []
        
        async for ticket_doc in cursor:
            ticket = Ticket(**ticket_doc, id=str(ticket_doc["_id"]))
            tickets.append(ticket)
        
        return tickets
    
    async def update_ticket(self, ticket_id: str, ticket_update: TicketUpdate) -> Optional[Ticket]:
        """Update a ticket."""
        db = await get_database()
        collection = db[self.collection_name]
        
        try:
            obj_id = ObjectId(ticket_id)
        except Exception:
            return None # Invalid ID format
        
        # --- CHANGE: Use .model_dump() instead of .dict() ---
        update_data = ticket_update.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        # Update ticket
        result = await collection.update_one(
            {"_id": obj_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            return None
        
        # Get updated ticket
        updated_ticket = await self.get_ticket(ticket_id)
        
        # --- CHANGE: Use fire_event ---
        if updated_ticket:
            fire_event(
                EventTypes.TICKET_UPDATED, # "ticket.updated"
                {
                    "ticket_id": updated_ticket.id,
                    "changes": update_data,
                    "status": updated_ticket.status,
                    "priority": updated_ticket.priority
                }
            )
        
        return updated_ticket
    
    async def delete_ticket(self, ticket_id: str) -> bool:
        """Delete a ticket."""
        db = await get_database()
        collection = db[self.collection_name]
        
        try:
            obj_id = ObjectId(ticket_id)
        except Exception:
            return False # Invalid ID format
            
        result = await collection.delete_one({"_id": obj_id})
        
        if result.deleted_count > 0:
            # --- CHANGE: Use fire_event ---
            fire_event(
                EventTypes.TICKET_DELETED, # "ticket.deleted"
                {"ticket_id": ticket_id}
            )
            return True
        
        return False
    
    async def get_ticket_count(
        self,
        status: Optional[Status] = None,
        priority: Optional[Priority] = None,
        assignee: Optional[str] = None
    ) -> int:
        """Get count of tickets with optional filtering."""
        db = await get_database()
        collection = db[self.collection_name]
        
        # Build filter query
        filter_query = {}
        if status:
            filter_query["status"] = status
        if priority:
            filter_query["priority"] = priority
        if assignee:
            filter_query["assignee"] = assignee
        
        return await collection.count_documents(filter_query)


# Global service instance
ticket_service = TicketService()