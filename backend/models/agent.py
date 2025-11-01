# backend/models/agent.py
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum

class AgentStatus(str, Enum):
    """Agent operational status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    ERROR = "error"
    MAINTENANCE = "maintenance"

class AgentType(str, Enum):
    """Types of AI agents in the system"""
    DUPLICATE_DETECTOR = "duplicate_detector"
    PRIORITY_CLASSIFIER = "priority_classifier"
    ESCALATION_AGENT = "escalation_agent"

class ProcessingResult(str, Enum):
    """Result of agent processing"""
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"
    PARTIAL = "partial"

class AgentConfig(BaseModel):
    """Configuration for an AI agent"""
    agent_type: AgentType = Field(..., description="Type of the agent")
    name: str = Field(..., min_length=1, max_length=100, description="Human-readable agent name")
    description: Optional[str] = Field(None, max_length=500, description="Agent description")
    enabled: bool = Field(True, description="Whether the agent is enabled")
    
    # Configuration parameters
    config_params: Dict[str, Any] = Field(default_factory=dict, description="Agent-specific configuration parameters")
    
    # Processing settings
    max_retries: int = Field(3, ge=0, le=10, description="Maximum number of retry attempts")
    timeout_seconds: int = Field(30, ge=1, le=300, description="Processing timeout in seconds")
    
    # Scheduling
    auto_trigger: bool = Field(True, description="Whether agent triggers automatically on events")
    trigger_events: List[str] = Field(default_factory=list, description="List of events that trigger this agent")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class AgentHealthCheck(BaseModel):
    """Health check response from an agent"""
    agent_type: AgentType = Field(..., description="Type of the agent")
    status: AgentStatus = Field(..., description="Current agent status")
    last_check: datetime = Field(default_factory=datetime.utcnow, description="When this health check was performed")
    
    # Health metrics
    uptime_seconds: Optional[int] = Field(None, ge=0, description="Agent uptime in seconds")
    total_processed: int = Field(0, ge=0, description="Total items processed by this agent")
    success_rate: Optional[float] = Field(None, ge=0, le=100, description="Success rate percentage")
    
    # Error information
    last_error: Optional[str] = Field(None, description="Last error message if any")
    error_count: int = Field(0, ge=0, description="Number of errors in current session")
    
    # Performance metrics
    avg_processing_time_ms: Optional[float] = Field(None, ge=0, description="Average processing time in milliseconds")
    
    # Additional status info
    status_message: Optional[str] = Field(None, max_length=200, description="Additional status information")

class AgentProcessingRequest(BaseModel):
    """Request to process a ticket with an agent"""
    ticket_id: str = Field(..., description="ID of the ticket to process")
    agent_type: AgentType = Field(..., description="Type of agent to use for processing")
    force_reprocess: bool = Field(False, description="Whether to force reprocessing even if already processed")
    priority: int = Field(1, ge=1, le=10, description="Processing priority (1=highest, 10=lowest)")

class AgentProcessingResponse(BaseModel):
    """Response from agent processing"""
    ticket_id: str = Field(..., description="ID of the processed ticket")
    agent_type: AgentType = Field(..., description="Type of agent that processed the ticket")
    result: ProcessingResult = Field(..., description="Result of the processing")
    
    # Processing details
    processing_time_ms: int = Field(..., ge=0, description="Time taken to process in milliseconds")
    processed_at: datetime = Field(default_factory=datetime.utcnow, description="When processing completed")
    
    # Results and changes
    changes_made: List[str] = Field(default_factory=list, description="List of changes made to the ticket")
    confidence_score: Optional[float] = Field(None, ge=0, le=1, description="Confidence in the processing result")
    
    # Error handling
    error_message: Optional[str] = Field(None, description="Error message if processing failed")
    retry_count: int = Field(0, ge=0, description="Number of retries attempted")
    
    # Agent-specific results
    agent_data: Dict[str, Any] = Field(default_factory=dict, description="Agent-specific result data")

class DuplicateDetectionResult(BaseModel):
    """Result from duplicate detection agent"""
    ticket_id: str = Field(..., description="ID of the ticket being checked")
    potential_duplicates: List[str] = Field(default_factory=list, description="List of potential duplicate ticket IDs")
    similarity_scores: Dict[str, float] = Field(default_factory=dict, description="Similarity scores for each potential duplicate")
    threshold_used: float = Field(..., ge=0, le=1, description="Similarity threshold used for detection")
    processing_time_ms: int = Field(..., ge=0, description="Time taken for duplicate detection")
    processed_at: datetime = Field(default_factory=datetime.utcnow)

class PriorityClassificationResult(BaseModel):
    """Result from priority classification agent"""
    ticket_id: str = Field(..., description="ID of the ticket being classified")
    suggested_priority: str = Field(..., description="Suggested priority level")
    confidence_score: float = Field(..., ge=0, le=1, description="Confidence in the classification")
    reasoning: List[str] = Field(default_factory=list, description="Reasons for the priority assignment")
    keywords_detected: List[str] = Field(default_factory=list, description="Keywords that influenced the classification")
    business_impact_score: Optional[float] = Field(None, ge=0, le=1, description="Assessed business impact score")
    urgency_score: Optional[float] = Field(None, ge=0, le=1, description="Assessed urgency score")
    processing_time_ms: int = Field(..., ge=0, description="Time taken for classification")
    processed_at: datetime = Field(default_factory=datetime.utcnow)

class EscalationResult(BaseModel):
    """Result from escalation agent"""
    ticket_id: str = Field(..., description="ID of the ticket being checked for escalation")
    should_escalate: bool = Field(..., description="Whether the ticket should be escalated")
    escalation_reason: Optional[str] = Field(None, description="Reason for escalation")
    time_since_creation_hours: float = Field(..., ge=0, description="Hours since ticket creation")
    sla_threshold_hours: float = Field(..., ge=0, description="SLA threshold in hours")
    escalation_level: Optional[int] = Field(None, ge=1, le=5, description="Escalation level (1-5)")
    notification_sent: bool = Field(False, description="Whether escalation notification was sent")
    processing_time_ms: int = Field(..., ge=0, description="Time taken for escalation check")
    processed_at: datetime = Field(default_factory=datetime.utcnow)