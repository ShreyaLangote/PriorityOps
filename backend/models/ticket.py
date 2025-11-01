# backend/models/ticket.py
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime
import uuid

class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Status(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"
    ESCALATED = "escalated"

class AuditEntry(BaseModel):
    timestamp: datetime
    action: str
    field: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    user: Optional[str] = None

class Ticket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: Priority = Priority.MEDIUM
    status: Status = Status.OPEN
    department: Optional[str] = Field(None, max_length=100)
    assignee: Optional[str] = Field(None, max_length=100)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    escalated_at: Optional[datetime] = None
    audit_trail: List[AuditEntry] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)

class TicketCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: Priority = Priority.MEDIUM
    department: Optional[str] = Field(None, max_length=100)
    assignee: Optional[str] = Field(None, max_length=100)
    tags: List[str] = Field(default_factory=list)

class TicketUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    department: Optional[str] = Field(None, max_length=100)
    assignee: Optional[str] = Field(None, max_length=100)
    tags: Optional[List[str]] = None

class TicketFilter(BaseModel):
    status: Optional[Status] = None
    priority: Optional[Priority] = None
    department: Optional[str] = None
    assignee: Optional[str] = None
    created_after: Optional[datetime] = None
    created_before: Optional[datetime] = None
